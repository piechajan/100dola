// Sdílený prodejní banner „kolo + výbava do boxu → letíš jen s příručákem".
// Používá ho Malaga přihláška i „pošli kolo do Malagy" poptávka — jeden zdroj pravdy.

export default function MalagaBoxBanner({ color = "#E8431A" }: { color?: string }) {
  return (
    <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: `${color}0F`, color: "#1a1a2e" }}>
      📦 Do boxu/krabice si dej <strong>veškeré vybavení na kolo i věci na cestu</strong> (oblečení,
      tretry, helma, nářadí…). Na palubu letadla ti pak stačí <strong>jen příručák.</strong> Žádné
      opakované balení, žádné placení kola v letadle.
    </div>
  );
}
