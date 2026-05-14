-- Invoices cache table — zrcadlo Fakturoid faktur pro rychlé dotazy + per-project analytics.
-- Apply v Supabase SQL Editor.

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  /** Fakturoid invoice ID — primární klíč na jejich straně. */
  fakturoid_id bigint not null unique,
  /** Číslo faktury jak ho vidí klient, např. "2026-0001". */
  number text not null,
  /** Project tag — kterému pilíři patří. */
  project text not null check (project in ('sport', 'lab', 'malaga', 'omc')),
  /** Náš orderId pokud byl invoice vytvořen z order (jen sport). */
  order_id text references orders(id) on delete set null,
  /** Subject (customer) na Fakturoid straně. */
  subject_id bigint,
  /** Status: open, paid, partial, cancelled, ... — zrcadlí Fakturoid status. */
  status text not null,
  /** Celkové částky (v haléřích pro přesnost — Fakturoid vrací stringy s desetinami). */
  total_with_vat_kc numeric(12, 2) not null,
  /** Vystaveno / splatnost / zaplaceno. */
  issued_on date not null,
  due_on date,
  paid_on date,
  /** Direct link na PDF v Fakturoidu (pre-signed URL). */
  pdf_url text,
  /** Link na detail v admin UI Fakturoidu. */
  html_url text,
  /** Cached payload pro debug / replay. */
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_project_idx on invoices (project);
create index if not exists invoices_order_id_idx on invoices (order_id);
create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_issued_on_idx on invoices (issued_on desc);

alter table invoices enable row level security;

-- Trigger pro updated_at
create or replace function update_invoices_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists invoices_updated_at on invoices;
create trigger invoices_updated_at
  before update on invoices
  for each row execute function update_invoices_updated_at();
