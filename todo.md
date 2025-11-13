# TODO

This file is managed by the assistant (Roo). Workflow:

- When you send the command `todo`, the assistant will read this file and continue work from the first incomplete item.
- The assistant cannot store persistent memory outside project files; this file is the single source of truth for tasks.

## Checklist

- [x] Start dev server (`npm run dev`) — running in terminal
- [x] Open local preview (Vite) — running
- [x] Create todo.md file (this file)
- [x] Fix AdminUsers modal accessibility issues
- [x] Implement notifications pagination in AdminNotifications — done 2025-11-06 (updated by assistant)
- [x] Analyze and extract rules from [.trae/rules/project_rules.md](.trae/rules/project_rules.md:1) and produce a structured mapping document at [docs/project_rules_schema.md](docs/project_rules_schema.md:1)
- [x] Create canonical runtime rules config file [.trae/config/project_rules.json](.trae/config/project_rules.json:1) and populate it from the mapping
- [-] Implement runtime loader [src/config/projectRules.js](src/config/projectRules.js:1) that reads the canonical JSON and exposes an enforcement API
- [ ] Enforce critical rules in backend middleware [backend/src/middleware/rulesEnforcer.js](backend/src/middleware/rulesEnforcer.js:1) (start with user deletion prohibition)
- [ ] Add unit and integration tests in [tests/rules/](tests/rules/:1) verifying rule enforcement and default behaviors
- [ ] Implement knowledge index generator [tools/generate_knowledge_index.js](tools/generate_knowledge_index.js:1) that scans repo and outputs [knowledge/index.json](knowledge/index.json:1)
- [ ] Implement knowledge service [src/services/knowledgeService.js](src/services/knowledgeService.js:1) that answers where-to-find queries from the generated index
- [ ] Add npm scripts: generate-index, verify (start/build + syntax check), test-rules in [package.json](package.json:1)
- [ ] Iteratively run dev server and fix syntax errors; record each fix as an item in this file and mark progress after each run
- [ ] After each task, run the site and add a verification record to the runtime rules config under last_checks in [.trae/config/project_rules.json](.trae/config/project_rules.json:1)
- [ ] Add CI job to regenerate knowledge index and run verify on PRs (update .github/workflows)
- [ ] Finalize implementation, run full test + verify, and mark this plan complete in this file

## Notes

- Files created by assistant: [docs/project_rules_schema.md](docs/project_rules_schema.md:1), [.trae/config/project_rules.json](.trae/config/project_rules.json:1), [src/config/projectRules.js](src/config/projectRules.js:1)
- To continue, type `todo` or run assistant command.
