/**
 * Runtime project rules loader
 *
 * Reads the canonical JSON config at .trae/config/project_rules.json via import
 * and exposes a small enforcement API used by backend and tooling.
 *
 * Note: this loader is read-only at runtime. File-write operations should be
 * performed by backend endpoints or dev tools.
 */

import rules from "../../.trae/config/project_rules.json";

const rulesCache = rules || {
  criticalRules: [],
  elementRegistry: {},
  fileOrganization: {},
  components: {},
  styling: {},
  hooksState: {},
  codeStyle: {},
  last_checks: [],
};

/**
 * Return the full rules object
 * @returns {object}
 */
export function listRules() {
  return rulesCache;
}

/**
 * Return a rule by id
 * @param {string} id
 * @returns {object|null}
 */
export function getRule(id) {
  return (rulesCache.criticalRules || []).find((r) => r.id === id) || null;
}

/**
 * Check whether a given action is allowed for a target based on criticalRules.
 * Example usage:
 *   isActionAllowed({ target: 'backend', action: 'block' })
 *
 * @param {{target: string, action: string}} opts
 * @returns {boolean} true if allowed, false if blocked by an always-enforced rule
 */
export function isActionAllowed({ target, action } = {}) {
  if (!target || !action) return true;
  const rule = (rulesCache.criticalRules || []).find((r) => {
    if (!r.target) return false;
    const targets = Array.isArray(r.target) ? r.target : [r.target];
    return (
      targets.includes(target) &&
      Array.isArray(r.actions) &&
      r.actions.includes(action)
    );
  });
  if (!rule) return true;
  // If enforcement is always and action is in actions -> disallow
  if (rule.enforcement === "always") return false;
  return true;
}

/**
 * Check a specific rule id against an action
 * @param {{ruleId: string, action: string}} opts
 * @returns {{allowed: boolean, rule: object|null}}
 */
export function checkAction({ ruleId, action } = {}) {
  const rule = getRule(ruleId);
  if (!rule) return { allowed: true, rule: null };
  const blocked =
    Array.isArray(rule.actions) &&
    rule.actions.includes(action) &&
    rule.enforcement === "always";
  return { allowed: !blocked, rule };
}

export default {
  listRules,
  getRule,
  isActionAllowed,
  checkAction,
};
