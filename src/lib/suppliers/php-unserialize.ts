// Minimální PHP `serialize()` deserializer.
// Podporuje: i, d, b, s, a, N (null), O (objects — basic).
// Použití: Sportimport posílá `configurator` element jako PHP-serialized payload.
//
// Reference formátu:
//   i:42;                 — int
//   d:1.5;                — double
//   b:1;                  — boolean
//   s:5:"hello";          — string (length = byte count, NE char count → musíme číst raw bytes)
//   a:2:{k;v;k;v;}        — array
//   N;                    — null
//   O:6:"stdClass":0:{}   — object (basic support)
//
// Pozor: PHP délka stringu je v BYTECH (utf-8 unicode = víc bajtů per char).
// Pracujeme s `Buffer` z Node, ne s JS stringem, abychom dostali přesné bajty.

export type PhpValue =
  | null
  | boolean
  | number
  | string
  | PhpValue[]
  | { [k: string]: PhpValue };

class Cursor {
  constructor(
    public buf: Buffer,
    public pos = 0,
  ) {}
  peek(): string {
    return String.fromCharCode(this.buf[this.pos]);
  }
  read(n: number): Buffer {
    const out = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }
  expect(ch: string): void {
    const got = String.fromCharCode(this.buf[this.pos]);
    if (got !== ch) {
      throw new Error(
        `PHP unserialize: očekáván '${ch}' na pozici ${this.pos}, dostal '${got}' (kontext: ${this.context()})`,
      );
    }
    this.pos += 1;
  }
  readUntil(ch: string): string {
    const start = this.pos;
    while (this.pos < this.buf.length && this.buf[this.pos] !== ch.charCodeAt(0)) {
      this.pos += 1;
    }
    return this.buf.subarray(start, this.pos).toString("utf8");
  }
  context(): string {
    const from = Math.max(0, this.pos - 20);
    const to = Math.min(this.buf.length, this.pos + 20);
    return this.buf.subarray(from, to).toString("utf8");
  }
}

function parseValue(c: Cursor): PhpValue {
  const type = c.peek();
  switch (type) {
    case "i":
      return parseInt(c);
    case "d":
      return parseDouble(c);
    case "b":
      return parseBool(c);
    case "s":
      return parseString(c);
    case "a":
      return parseArray(c);
    case "N":
      return parseNull(c);
    case "O":
      return parseObject(c);
    default:
      throw new Error(
        `PHP unserialize: neznámý typ '${type}' na pozici ${c.pos} (kontext: ${c.context()})`,
      );
  }
}

function parseInt(c: Cursor): number {
  c.expect("i");
  c.expect(":");
  const val = c.readUntil(";");
  c.expect(";");
  return Number.parseInt(val, 10);
}

function parseDouble(c: Cursor): number {
  c.expect("d");
  c.expect(":");
  const val = c.readUntil(";");
  c.expect(";");
  return Number.parseFloat(val);
}

function parseBool(c: Cursor): boolean {
  c.expect("b");
  c.expect(":");
  const val = c.read(1).toString("ascii");
  c.expect(";");
  return val === "1";
}

function parseString(c: Cursor): string {
  c.expect("s");
  c.expect(":");
  const lenStr = c.readUntil(":");
  c.expect(":");
  c.expect('"');
  const len = Number.parseInt(lenStr, 10);
  const bytes = c.read(len);
  c.expect('"');
  c.expect(";");
  return bytes.toString("utf8");
}

function parseNull(c: Cursor): null {
  c.expect("N");
  c.expect(";");
  return null;
}

function parseArray(c: Cursor): PhpValue[] | Record<string, PhpValue> {
  c.expect("a");
  c.expect(":");
  const countStr = c.readUntil(":");
  c.expect(":");
  c.expect("{");
  const count = Number.parseInt(countStr, 10);

  // PHP arrays jsou hybrid (může mít int i string klíče). Detekujeme:
  // pokud všechny klíče jsou sequential ints 0..n-1 → JS array, jinak → object.
  const pairs: Array<[number | string, PhpValue]> = [];
  for (let i = 0; i < count; i += 1) {
    const key = parseValue(c) as number | string;
    const value = parseValue(c);
    pairs.push([key, value]);
  }
  c.expect("}");

  const isSequentialIntKeys =
    pairs.length > 0 &&
    pairs.every(([k], idx) => typeof k === "number" && k === idx);
  if (isSequentialIntKeys) {
    return pairs.map(([, v]) => v);
  }
  const obj: Record<string, PhpValue> = {};
  for (const [k, v] of pairs) obj[String(k)] = v;
  return obj;
}

function parseObject(c: Cursor): Record<string, PhpValue> {
  // O:8:"ClassName":2:{s:3:"foo";s:3:"bar";}
  c.expect("O");
  c.expect(":");
  const nameLen = Number.parseInt(c.readUntil(":"), 10);
  c.expect(":");
  c.expect('"');
  c.read(nameLen); // class name — ignorujeme
  c.expect('"');
  c.expect(":");
  const propCount = Number.parseInt(c.readUntil(":"), 10);
  c.expect(":");
  c.expect("{");

  const obj: Record<string, PhpValue> = {};
  for (let i = 0; i < propCount; i += 1) {
    const key = parseValue(c) as string;
    const value = parseValue(c);
    obj[key] = value;
  }
  c.expect("}");
  return obj;
}

/**
 * Hlavní entry point — deserializuje PHP `serialize()` output.
 * @throws Error pokud format invalid.
 */
export function phpUnserialize(input: string | Buffer): PhpValue {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  const cursor = new Cursor(buf);
  return parseValue(cursor);
}
