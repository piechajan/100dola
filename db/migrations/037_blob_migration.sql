-- Tabulky pro stavovou migraci Supabase Storage → Vercel Blob.
-- Důvod: free Supabase Storage limit 1 GB překročen; migrujeme obrázky do
-- Vercel Blob (100 GB free na Pro plánu). Skript v /api/admin/migrate-blob
-- běží v batchích, drží progress + mapping mezi voláními.

CREATE TABLE IF NOT EXISTS blob_migration_progress (
  id integer PRIMARY KEY DEFAULT 1,
  last_folder text,
  last_file text,
  total_migrated integer NOT NULL DEFAULT 0,
  total_errors integer NOT NULL DEFAULT 0,
  total_bytes bigint NOT NULL DEFAULT 0,
  finished_at timestamptz,
  CONSTRAINT singleton CHECK (id = 1)
);
ALTER TABLE blob_migration_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS blob_migration_mapping (
  id bigserial PRIMARY KEY,
  old_url text NOT NULL,
  new_url text NOT NULL,
  size integer NOT NULL,
  folder text NOT NULL,
  file_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(folder, file_name)
);
CREATE INDEX IF NOT EXISTS idx_blob_mig_oldurl ON blob_migration_mapping(old_url);
ALTER TABLE blob_migration_mapping ENABLE ROW LEVEL SECURITY;
