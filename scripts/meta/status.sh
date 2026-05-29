#!/bin/bash
# Meta status — co je nastaveno, co chybí, co běží
#
# Použití:  bash scripts/meta/status.sh

source "$(dirname "$0")/_config.sh"

echo "═══════════════════════════════════════════════════════════"
echo "  META STATUS · 100dola"
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "🔑 TOKEN scopes:"
api GET "debug_token" --data-urlencode "input_token=$META_TOKEN" | python3 -c "
import json,sys
d=json.load(sys.stdin).get('data',{})
print(f\"   App: {d.get('application','?')} (ID {d.get('app_id','?')})\")
print(f\"   Type: {d.get('type','?')}\")
print(f\"   Scopes: {', '.join(d.get('scopes',[]))}\")
print(f\"   Valid: {d.get('is_valid','?')}\")
"

echo ""
echo "📱 APP status:"
api GET "$META_APP_ID" --data-urlencode "fields=name,category,privacy_policy_url,terms_of_service_url" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f\"   Name: {d.get('name','?')}\")
print(f\"   Category: {d.get('category','MISSING ⚠️')}\")
print(f\"   Privacy: {'OK' if d.get('privacy_policy_url') else 'MISSING ⚠️'}\")
print(f\"   ToS: {'OK' if d.get('terms_of_service_url') else 'MISSING ⚠️'}\")
"

echo ""
echo "📊 CAMPAIGNS:"
api GET "$META_AD_ACCOUNT/campaigns" --data-urlencode "fields=id,name,status,configured_status,effective_status,objective" --data-urlencode "limit=10" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
for c in data:
    badge = '🟢' if c.get('effective_status')=='ACTIVE' else '⏸️' if c.get('effective_status')=='PAUSED' else '⏹️'
    print(f\"   {badge} {c.get('name','?')[:60]} — {c.get('effective_status','?')}\")
"

echo ""
echo "🎯 CUSTOM CONVERSIONS:"
api GET "$META_AD_ACCOUNT/customconversions" --data-urlencode "fields=id,name,rule,is_archived" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
for c in data:
    if not c.get('is_archived'):
        print(f\"   ✅ {c.get('name','?')} (ID {c.get('id','?')})\")
"

echo ""
echo "👥 CUSTOM AUDIENCES:"
api GET "$META_AD_ACCOUNT/customaudiences" --data-urlencode "fields=id,name,subtype,approximate_count_lower_bound" --data-urlencode "limit=20" | python3 -c "
import json,sys
data=json.load(sys.stdin).get('data',[])
for a in data:
    size = a.get('approximate_count_lower_bound','?')
    print(f\"   👤 {a.get('name','?')} (~{size} lidí, {a.get('subtype','?')})\")
"

echo ""
echo "═══════════════════════════════════════════════════════════"
