# Project rules schema

This document maps [`.trae/rules/project_rules.md`](.trae/rules/project_rules.md:1) to a canonical runtime JSON config at [`.trae/config/project_rules.json`](.trae/config/project_rules.json:1).

## Purpose

- Provide machine-readable rules for runtime enforcement and discoverability.

## Top-level mapping

- criticalRules: array of objects { id, description, enforcement, target }
- elementRegistry: object { format, zones, registryStorage }
- fileOrganization: { strategy, naming, barrelExports }
- components: { principles, sizes, propsPolicy }
- styling: { prefer, customClasses }
- hooksState: { customHooks, stateLocation, useEffectDependencyPolicy }
- codeStyle: { naming, earlyReturn, constLetVar, arrowFunctions, maxFileLines }

## JSON example

```json
{
  "criticalRules": [
    {
      "id": "no_user_deletion",
      "description": "Do not delete users except with explicit request",
      "enforcement": "always",
      "target": "backend"
    }
  ],
  "elementRegistry": {
    "format": "[Page].[Subpage].[Zone][Element]",
    "zones": {
      "H": "Header",
      "L": "Left Sidebar",
      "R": "Right Sidebar",
      "B": "Body",
      "F": "Footer"
    },
    "storage": "elementRegistry.json"
  },
  "fileOrganization": {
    "strategy": "feature-based",
    "naming": { "components": "PascalCase", "files": "kebab-case" },
    "barrelExports": true
  },
  "codeStyle": {
    "maxFileLines": 1200,
    "preferConst": true,
    "arrowFunctions": true
  },
  "last_checks": []
}
```

## Enforcement notes

- Implement backend middleware to enforce criticalRules such as no_user_deletion.
- Expose runtime API [`src/config/projectRules.js`](src/config/projectRules.js:1) with getRule(id) and listRules().
- Add tests under [`tests/rules/`](tests/rules/:1).

## Produced files

- [` .trae/config/project_rules.json`](.trae/config/project_rules.json:1)
- [`src/config/projectRules.js`](src/config/projectRules.js:1)
- [`tests/rules/`](tests/rules/:1)
