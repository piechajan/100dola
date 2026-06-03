"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UploadResult {
  filename: string;
  inserted: number;
  duplicates: number;
  errors: string[];
}

export default function UploadForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("file") as File[];
    if (files.length === 0 || files.every((f) => f.size === 0)) {
      setError("Vyber alespoň jeden ZIP / XML soubor.");
      return;
    }
    setUploading(true);
    try {
      const r = await fetch("/api/admin/dmarc/upload", {
        method: "POST",
        body: formData,
      });
      if (!r.ok) {
        setError(`Upload selhal: ${r.status}`);
        return;
      }
      const j = await r.json();
      setResults(j.results ?? []);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F3] p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-2">
            DMARC ZIP / XML / GZ soubory
          </span>
          <input
            type="file"
            name="file"
            multiple
            accept=".zip,.xml,.gz,application/zip,application/gzip,text/xml"
            className="block w-full text-sm text-[#5A6480] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#F0F4FF] file:text-[#1a1a2e] hover:file:bg-[#DBEAFE]"
          />
          <p className="text-[10px] text-[#9AA3C2] mt-1">
            Najdeš je v gmailu od noreply-dmarc-support@google.com (nebo Seznam/Yahoo).
            Klidně nahraj víc najednou.
          </p>
        </label>
        {error && (
          <div className="rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs p-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40"
        >
          {uploading ? "Zpracovávám…" : "Nahrát + parsovat"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E2E6F3] space-y-2">
          {results.map((r) => (
            <div key={r.filename} className="text-xs">
              <span className="font-mono font-bold">{r.filename}:</span>{" "}
              <span className="text-[#065F46]">+{r.inserted} nových</span>
              {r.duplicates > 0 && (
                <span className="text-[#9AA3C2] ml-2">~{r.duplicates} duplikátů</span>
              )}
              {r.errors.length > 0 && (
                <span className="text-[#991B1B] ml-2">
                  {r.errors.length} chyb: {r.errors.slice(0, 2).join(" | ")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
