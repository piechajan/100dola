#!/bin/bash
# Denní audit — kontrola že kampaně, ads a tracking fungují.
# Spustitelné lokálně nebo z Vercel cron.
#
# Použití: bash scripts/meta/audit.sh

source "$(dirname "$0")/_config.sh"

WARN=0
ERR=0

echo "═══════════════════════════════════════════════════════════"
echo "  AUDIT · $(date '+%Y-%m-%d %H:%M')"
echo "═══════════════════════════════════════════════════════════"

# 1) Token
echo ""
echo "🔑 Token check..."
valid=$(api GET "debug_token" --data-urlencode "input_token=$META_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('data',{}).get('is_valid',False))")
if [ "$valid" = "True" ]; then
  echo "   ✅ valid"
else
  echo "   ❌ INVALID — token expired or revoked"
  ERR=$((ERR+1))
fi

# 2) Pixel + recent events
echo ""
echo "📊 Pixel events (24h)..."
events=$(api GET "$META_PIXEL_ID/stats" --data-urlencode "aggregation=count" --data-urlencode "start_time=$(($(date +%s) - 86400))" | python3 -c "
import json,sys
d=json.load(sys.stdin).get('data',[])
total=sum(e.get('value',0) for e in d)
print(total)
" 2>/dev/null || echo "0")
echo "   Events: $events"
if [ "$events" -lt 5 ]; then
  echo "   ⚠️  Velmi málo events za 24h — možná tracking issue"
  WARN=$((WARN+1))
fi

# 3) Active campaigns
echo ""
echo "📣 Active campaigns..."
active=$(api GET "$META_AD_ACCOUNT/campaigns" --data-urlencode "effective_status=[\"ACTIVE\"]" --data-urlencode "fields=id,name" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
print(len(data))
for c in data:
    print(f'   🟢 {c[\"name\"][:60]}')
")
echo "$active"

# 4) Spend last 7 days
echo ""
echo "💰 Spend last 7d..."
spend=$(api GET "$META_AD_ACCOUNT/insights" --data-urlencode "date_preset=last_7d" --data-urlencode "fields=spend,impressions,clicks,actions" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
if not data:
    print('   (žádný spend za posledních 7 dní)')
else:
    d=data[0]
    print(f\"   Spend: {d.get('spend','0')} CZK\")
    print(f\"   Impressions: {d.get('impressions','0')}\")
    print(f\"   Clicks: {d.get('clicks','0')}\")
    actions=d.get('actions',[])
    leads=next((a['value'] for a in actions if a.get('action_type')=='lead'),'0')
    print(f\"   Leads: {leads}\")
")
echo "$spend"

# 5) Custom audiences populated?
echo ""
echo "👥 Audience sizes..."
api GET "$META_AD_ACCOUNT/customaudiences" --data-urlencode "fields=name,approximate_count_lower_bound" --data-urlencode "limit=10" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
for a in data:
    size=a.get('approximate_count_lower_bound',0)
    icon='⚠️' if size<1000 else '✅'
    print(f'   {icon} {a[\"name\"]}: ~{size}')
"

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
if [ "$ERR" -gt 0 ]; then
  echo "❌ $ERR error(s), $WARN warning(s)"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️  $WARN warning(s)"
  exit 0
else
  echo "✅ Vše v pořádku"
fi
