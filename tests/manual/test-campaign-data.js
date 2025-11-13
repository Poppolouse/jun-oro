import userLibraryService from "./src/services/userLibrary.js";
import gameCacheService from "./src/services/gameCache.js";

// Test script to add campaign data to Total War: Warhammer III
console.log("🔍 Checking current game data...");

// Get current user library
const library = userLibraryService.getUserLibrary();
console.log("Current library:", library);

// Get game cache
const cache = gameCacheService.getCache();
console.log("Current cache:", cache);

// Find Total War: Warhammer III
const totalWarGame = Object.values(cache).find(
  (game) => game.name && game.name.includes("Total War: Warhammer III"),
);

if (totalWarGame) {
  console.log("Found Total War: Warhammer III:", totalWarGame);

  // Add campaign data if not exists
  if (!totalWarGame.campaigns || totalWarGame.campaigns.length === 0) {
    totalWarGame.campaigns = [
      {
        id: "immortal-empires",
        name: "Immortal Empires",
        description:
          "The ultimate Total War: Warhammer experience combining all three games",
        mainStoryTime: 120,
        mainExtraTime: 200,
        completionistTime: 350,
        averageTime: 150,
        isMainCampaign: true,
        difficulty: "Hard",
        features: ["Massive map", "All factions", "Legendary Lords"],
      },
      {
        id: "realm-of-chaos",
        name: "The Realm of Chaos",
        description: "The main campaign featuring the forces of Chaos",
        mainStoryTime: 25,
        mainExtraTime: 40,
        completionistTime: 60,
        averageTime: 35,
        isMainCampaign: true,
        difficulty: "Medium",
        features: ["Story-driven", "Chaos mechanics", "Narrative campaign"],
      },
    ];

    // Update the cache
    gameCacheService.addGame(totalWarGame.id, totalWarGame);
    console.log("✅ Campaign data added to Total War: Warhammer III");
  } else {
    console.log("Campaign data already exists:", totalWarGame.campaigns);
  }
} else {
  console.log("❌ Total War: Warhammer III not found in cache");
  console.log(
    "Available games:",
    Object.values(cache).map((g) => g.name),
  );
}
