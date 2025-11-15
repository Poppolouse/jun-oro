/*
  Seed API keys into the backend database via /api/api-keys.
  Run with: node scripts/seedApiKeys.js
  Note: Always uses production backend (Render)
*/

const endpoint = "https://api.jun-oro.com/api/api-keys";

// Values provided by user
const IGDB_CLIENT_ID = "h9uple668oa0ugvi78noi1baopi3e3";
const IGDB_CLIENT_SECRET = "8od7d77gebozbi85iag2meztxd9b3l";
const IGDB_ACCESS_TOKEN = "lngo86jy6zjpx3u0tbvhxy88avubmr";
const STEAM_API_KEY = "5C002F6B38021E0A64177095D5FD9476";

async function postKey({ serviceName, keyName, keyValue, isGlobal = true, metadata = {} }) {
  const body = { serviceName, keyName, keyValue, isGlobal, metadata };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  try {
    console.log("Seeding API keys...");

    // IGDB Client ID
    await postKey({
      serviceName: "igdb_client_id",
      keyName: "IGDB Client ID",
      keyValue: IGDB_CLIENT_ID,
      isGlobal: true,
      metadata: { description: "IGDB Client ID for API authentication" },
    }).then(() => console.log("✔ IGDB Client ID saved"));

    // IGDB Client Secret (optional storage for future use)
    await postKey({
      serviceName: "igdb_client_secret",
      keyName: "IGDB Client Secret",
      keyValue: IGDB_CLIENT_SECRET,
      isGlobal: true,
      metadata: { description: "IGDB Client Secret for OAuth" },
    }).then(() => console.log("✔ IGDB Client Secret saved"));

    // IGDB Access Token
    await postKey({
      serviceName: "igdb_access_token",
      keyName: "IGDB Access Token",
      keyValue: IGDB_ACCESS_TOKEN,
      isGlobal: true,
      metadata: { description: "IGDB Access Token for API requests" },
    }).then(() => console.log("✔ IGDB Access Token saved"));

    // Steam API Key
    await postKey({
      serviceName: "steam",
      keyName: "Steam Web API Key",
      keyValue: STEAM_API_KEY,
      isGlobal: true,
      metadata: { description: "Steam Web API Key for web API requests" },
    }).then(() => console.log("✔ Steam API Key saved"));

    console.log("All keys seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

run();

