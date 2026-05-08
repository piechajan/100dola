#!/usr/bin/env node
// Interaktivní helper pro získání Strava refresh tokenu.
// Spuštění: node scripts/strava-oauth.mjs
//
// Co to dělá:
// 1. Zeptá se na CLIENT_ID a CLIENT_SECRET (z developers.strava.com)
// 2. Vypíše URL pro autorizaci → otevři v browseru a povol scopes
// 3. Po redirectu z localhost zkopíruj `code` z URL a vlož sem
// 4. Skript ho vymění za refresh_token
// 5. Vypíše env vars k vložení do .env.local a Vercel

import http from "node:http";
import { URL } from "node:url";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/strava-callback`;
const SCOPES = "read,read_all,profile:read_all,activity:read_all";

const rl = readline.createInterface({ input, output });

function ask(q) {
  return rl.question(q);
}

async function main() {
  console.log("\n=== Strava OAuth setup ===\n");
  console.log("1) Otevři https://www.strava.com/settings/api a vytvoř aplikaci.");
  console.log(`   Authorization Callback Domain: localhost`);
  console.log(`   Po vytvoření zkopíruj Client ID a Client Secret.\n`);

  const clientId = (await ask("Client ID: ")).trim();
  const clientSecret = (await ask("Client Secret: ")).trim();

  if (!clientId || !clientSecret) {
    console.error("Client ID i Secret jsou povinné. Konec.");
    rl.close();
    process.exit(1);
  }

  // Sestav authorize URL
  const authUrl = new URL("https://www.strava.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("approval_prompt", "force");
  authUrl.searchParams.set("scope", SCOPES);

  console.log("\n2) Otevři tuto URL v browseru, povol scopes:\n");
  console.log(authUrl.toString());
  console.log("\nČekám na callback na portu", REDIRECT_PORT, "...\n");

  // Spusť mini http server pro callback
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      if (u.pathname === "/strava-callback") {
        const c = u.searchParams.get("code");
        const err = u.searchParams.get("error");
        if (err || !c) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end(`Chyba: ${err || "no code"}`);
          server.close();
          reject(new Error(err || "no code"));
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>OK</h1><p>Můžeš zavřít tento tab a vrátit se do terminálu.</p>`);
        server.close();
        resolve(c);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(REDIRECT_PORT);
    setTimeout(() => {
      server.close();
      reject(new Error("Timeout — nepřišel callback do 5 minut."));
    }, 5 * 60 * 1000);
  });

  console.log("3) Vyměňuju authorization code za refresh token...");

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Token exchange selhal:", tokenRes.status, await tokenRes.text());
    rl.close();
    process.exit(1);
  }

  const data = await tokenRes.json();

  console.log("\n=== HOTOVO ===\n");
  console.log("Vlož toto do .env.local v adresáři web/ a do Vercel env vars:\n");
  console.log(`STRAVA_CLIENT_ID=${clientId}`);
  console.log(`STRAVA_CLIENT_SECRET=${clientSecret}`);
  console.log(`STRAVA_REFRESH_TOKEN=${data.refresh_token}`);
  console.log(`STRAVA_CLUB_ID=2070600`);
  console.log("\nAccess token (info, nepoužívat — Refresh token je to, co potřebujeme):");
  console.log(data.access_token);
  console.log(`\nExpires at: ${new Date(data.expires_at * 1000).toISOString()}`);
  console.log("\nAuthorized athlete:", data.athlete?.firstname, data.athlete?.lastname);

  rl.close();
}

main().catch((e) => {
  console.error("Chyba:", e.message);
  rl.close();
  process.exit(1);
});
