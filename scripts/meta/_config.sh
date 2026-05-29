#!/bin/bash
# Shared config pro Meta helper scripts.
# Načítá env z Vercel production a exportuje konstanty.

set -eo pipefail

# Načti Meta token z Vercel
if [ ! -f /tmp/.env.meta ]; then
  vercel env pull /tmp/.env.meta --environment=production --yes >/dev/null 2>&1
fi

export META_TOKEN=$(grep "^META_CAPI_ACCESS_TOKEN=" /tmp/.env.meta | cut -d'"' -f2)
export META_PIXEL_ID="1867612187213152"
export META_APP_ID="973141468640171"
export META_AD_ACCOUNT="act_647471898078601"
export META_BUSINESS_ID="1362363054962597"
export META_FB_PAGE_ID="1030724350135010"
export META_SYSTEM_USER_ID="61580033733753"
export META_GRAPH="https://graph.facebook.com/v21.0"

# Custom Conversions
export META_CC_ISAAC_RESERVATION="969227559054115"

# Custom Audiences
export META_AUD_WEB_ISAAC="120245264506730446"
export META_AUD_IG_ENG="120245264543440446"
export META_AUD_FB_ENG="120245264615670446"

# Existing kampaň + ad sety (PAUSED, ready)
export META_CAMP_ISAAC="120245268070110446"
export META_ADSET_COLD="120245268297360446"
export META_ADSET_RETARGET="120245268306880446"

# Helper
api() {
  local method="$1"; shift
  local endpoint="$1"; shift
  if [ "$method" = "GET" ]; then
    curl -s -G "${META_GRAPH}/${endpoint}" "$@" --data-urlencode "access_token=$META_TOKEN"
  else
    curl -s -X "$method" "${META_GRAPH}/${endpoint}" "$@" --data-urlencode "access_token=$META_TOKEN"
  fi
}
export -f api
