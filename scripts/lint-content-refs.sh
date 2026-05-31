#!/usr/bin/env bash
# Content reference linter — kontroluje, že klíčové konstanty napříč repo zůstávají konzistentní.
# Volá se z .husky/pre-commit. Selhání = commit nepustí.
#
# Pravidla:
#  - Závod Míru U23: jen "13. ročník" (NE "73. ročník" — to je předchozí Course de la Paix)
#  - Závod Míru dojezd: jen "15:10" / "15:25" / "14:30" (NE "17:00–17:30" — staré WebSearch data)
#  - Telefon: +420 739 045 057
#  - IČO FUTUNATU: 07376766

set -e
ERR=0

# Helper: hledá v src/ a vrací jen pole, která NEjsou dovolená výjimka
forbidden() {
  local pattern="$1"
  local label="$2"
  local exclude="$3"

  local hits
  if [ -n "$exclude" ]; then
    hits=$(grep -rnE "$pattern" src 2>/dev/null | grep -vE "$exclude" || true)
  else
    hits=$(grep -rnE "$pattern" src 2>/dev/null || true)
  fi

  if [ -n "$hits" ]; then
    echo ""
    echo "❌ Content lint: $label"
    echo "$hits"
    ERR=$((ERR+1))
  fi
}

# 1. Závod Míru — žádný "73. ročník" (správně 13. ročník U23 verze)
forbidden '73\.\s*ro[čc]n[íi]k' "Nalezen '73. ročník' (Závod Míru U23 2026 = 13. ročník, viz reference_zavod_miru_2026)"

# 2. Závod Míru — žádný čas dojezdu 17:00 / 17:30
#    Výjimky: opening hours prodejny (closes:, otevírací doba čtvrtek)
forbidden '17:00[^0-9]{0,4}17:30|17:00–17:30|dojezd[^.]{0,40}17:00' \
  "Nalezen čas dojezdu 17:00–17:30 (správně 15:10 dle harmonogramu města Šternberka, viz reference_zavod_miru_2026)" \
  'closes:|opening_hours|čtvrtek:'

# 3. Závod Míru — UCI kategorie konzistence
forbidden '2\.Ncup|Nations.{0,5}Cup' \
  "Nalezena stará UCI kategorie '2.Ncup' (správně 'UCI Europe Tour 2.2U' per sternberk.eu 2026)"

if [ "$ERR" -gt 0 ]; then
  echo ""
  echo "→ $ERR content reference error(s). Oprav před commitem."
  exit 1
fi

echo "✓ content references konzistentní"
