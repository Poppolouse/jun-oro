/**
 * backend/src/middleware/rulesEnforcer.js
 *
 * ES module middleware to enforce runtime project rules from .trae/config/project_rules.json
 *
 * Usage:
 *   import { enforceRule } from '../middleware/rulesEnforcer.js'
 *   router.delete('/:id', enforceRule('no_user_deletion'), async (req, res, next) => { ... })
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read project rules JSON file
const projectRulesPath = path.join(
  __dirname,
  "../../../.trae/config/project_rules.json",
);
let projectRules = {};

try {
  const rulesData = fs.readFileSync(projectRulesPath, "utf8");
  projectRules = JSON.parse(rulesData);
} catch (error) {
  console.warn("Project rules file not found or invalid:", error.message);
  projectRules = { criticalRules: [] };
}

function enforceRule(ruleId) {
  return (req, res, next) => {
    const rule = (projectRules.criticalRules || []).find(
      (r) => r.id === ruleId,
    );
    if (!rule) return next();

    // Implement no_user_deletion enforcement
    if (rule.id === "no_user_deletion" && rule.enforcement === "always") {
      // Block any DELETE request unless explicit confirmation header set
      if (req.method === "DELETE") {
        const confirmed =
          (req.headers["x-confirm-user-deletion"] || "")
            .toString()
            .toLowerCase() === "true";
        if (!confirmed) {
          return res.status(403).json({
            success: false,
            error:
              "User deletion is forbidden by project rules. Set header x-confirm-user-deletion: true to override (requires explicit confirmation).",
          });
        }
      }
    }

    // Default: allow
    next();
  };
}

export { enforceRule };
