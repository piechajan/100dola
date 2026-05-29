#!/bin/bash
# One-command activator: spustí Cold ad set (PAUSED → ACTIVE)
# Předpoklady: ad set má alespoň 1 reklamu (ad creative).
#
# Použití: bash scripts/meta/launch-isaac-cold.sh

source "$(dirname "$0")/_config.sh"

echo "═══════════════════════════════════════════════════════════"
echo "  LAUNCH · ISAAC Cold ad set"
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "📋 Aktuální stav ad setu $META_ADSET_COLD:"
api GET "$META_ADSET_COLD" --data-urlencode "fields=name,status,configured_status,daily_budget,end_time" | python3 -m json.tool

echo ""
echo "📋 Reklamy v ad setu:"
ads=$(api GET "$META_ADSET_COLD/ads" --data-urlencode "fields=id,name,status")
echo "$ads" | python3 -m json.tool
ad_count=$(echo "$ads" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('data',[])))")

if [ "$ad_count" = "0" ]; then
  echo ""
  echo "⚠️  Ad set nemá žádnou reklamu — nelze spustit."
  echo "   Musíš nejdřív vytvořit reklamu v UI Ads Manager."
  exit 1
fi

echo ""
echo "🚀 Aktivuji ad set ($META_ADSET_COLD) + kampaň ($META_CAMP_ISAAC) → ACTIVE"
api POST "$META_ADSET_COLD" --data-urlencode "status=ACTIVE" | python3 -m json.tool
api POST "$META_CAMP_ISAAC" --data-urlencode "status=ACTIVE" | python3 -m json.tool

echo ""
echo "✅ Hotovo — Meta review trvá 30 min – 4h. Pak reklama jde live."
echo "   Status: bash scripts/meta/status.sh"
