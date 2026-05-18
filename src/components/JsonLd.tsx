// Server component pro vložení JSON-LD strukturovaných dat do <head>.
// Použití: <JsonLd data={{ "@context": "https://schema.org", ... }} />

interface Props {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
