# Jun-Oro Copilot Instructions

## Project Overview

Jun-Oro is a gaming library management platform with React/Vite frontend and Node.js/Express backend. The codebase uses **Turkish language** for user-facing content and documentation. All code is in **English**, but UI strings, comments, and user messages are in **Turkish**.

## Architecture Quick Reference

### Frontend Structure
- **Framework**: React 18 + Vite + Tailwind CSS
- **State Management**: React Context API (`AuthContext`, `ActiveSessionContext`, `NavigationContext`)
- **Routing**: React Router with lazy-loaded pages via `React.lazy()`
- **Import Aliases**: Use `@` prefix (e.g., `@components`, `@hooks`, `@services`)

### Backend Structure
- **Framework**: Express.js with ESM modules (`type: "module"`)
- **ORM**: Prisma with PostgreSQL (schema: `backend/prisma/schema.prisma`)
- **Authentication**: JWT-based with bcrypt password hashing
- **Storage**: Cloudflare R2 for images/files
- **Validation**: Zod schemas via `backend/src/lib/validationHelpers.js`

### Key Data Models
- `User` (role: admin/user, relations: LibraryEntry, GameSession, ApiKey)
- `Game` (cached data from IGDB/Steam/HLTB, relations: LibraryEntry, Campaign)
- `LibraryEntry` (user-game junction with status, playtime, category)
- `GameSession` (active play tracking with campaigns, platform)
- `Campaign` (hierarchical game modes/DLCs with parent-child relations)

## Critical Conventions

### ERS (Element Registry System)
Every UI element **must** have a `data-ers` attribute following the pattern: `PAGE.SECTION.CONTAINER.ELEMENT`

```jsx
// Example: FAQ page, category section, question item
<div data-ers="faq-page.category.getting-started.question-item.1">
```

- **Registry**: All ERS codes documented in `docs/ERS-REGISTRY.md`
- **Element Registry JSON**: `elementRegistry.json` at root must be committed (CI enforced)
- **Zone Codes**: H (Header), L (Left Sidebar), R (Right Sidebar), B (Body), F (Footer)
- **Dynamic Elements**: Use template syntax for loops: `{id}`, `{n}`, `{rid}`
- **Required**: Update registry when adding/removing/renaming elements
- **Purpose**: Tutorial system, element tracking, design tooling

### Component Organization
- **Strategy**: Feature-based organization preferred
- **Single Responsibility**: Components should have one clear purpose
- **Props**: Always destructure props at function signature
- **Barrel Exports**: Use `index.js` for clean imports
- **Custom Hooks**: Extract complex logic into custom hooks (required for reusable state)
- **State Location**: Keep state at nearest common ancestor, not global unless truly needed

### File Size Limits
- **Max file size**: 300 lines (ideal), 500+ triggers refactoring discussion, 1200 hard limit (CI fails)
- **Max component size**: 200 lines (enforced)
- **Max function size**: 50 lines (ideal), 100+ triggers refactoring discussion
- **Enforcement**: CI checks, mentioned in `CLAUDE_RULES.md` checklist

### Naming Standards
```javascript
// Variables & Functions: camelCase
const gameData = await fetchGameDetails();
function handleUserLogin() {}

// Booleans: Question form
const isActive = true;
const hasPermission = false;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT = 10000;

// Components & Files: PascalCase
// GameCard.jsx, AddGameModal.jsx
```

### Code Quality Principles
- **DRY**: Don't repeat code - extract to functions
- **Single Responsibility**: One function does one thing
- **Early Return**: Use guard clauses, avoid deep nesting (max 3 levels)
- **No Magic Numbers**: Extract to named constants
- **Comments**: JSDoc for all public functions, inline for complex logic

### Error Handling Pattern
```javascript
// Backend routes - always try-catch with detailed logs
try {
  const result = await prisma.game.findUnique({ where: { id } });
  res.json(result);
} catch (error) {
  console.error('Oyun verisi alınamadı:', error);
  res.status(500).json({ 
    error: 'Bir hata oluştu',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
}

// Frontend - use context/hook error states
const [error, setError] = useState(null);
try {
  await api.saveGame(data);
} catch (err) {
  setError('Oyun kaydedilemedi. Lütfen tekrar deneyin.');
}
```

## Development Workflow

### Iterative Development Approach
- **Break tasks** into 5-10 minute chunks
- **Use checklists**: Track progress with `[ ]` → `[X]` markdown checkboxes
- **Update timestamps**: Document when each step is completed
- **Ask first**: Always confirm config/credentials, design decisions, platform choices
- **Don't assume**: Check existing patterns in `docs/DESIGN-SYSTEM.md` and `docs/DESIGN-PREFERENCES.md`

### Running the Application
```powershell
# Frontend (port 3000) - DO NOT run via terminal tool
# Tell user: "Terminal'de manuel çalıştır: npm run dev"

# Backend (port 5000) - DO NOT run via terminal tool  
# Tell user: "Backend klasöründe manuel çalıştır: cd backend; npm run dev"

# Safe commands you CAN run:
npm run lint                    # ESLint check
npm run lint -- --fix          # Auto-fix linting
npm run build                  # Production build
npm test                       # Run tests
npm run db:studio              # Prisma Studio (after prompting)
```

### Database Workflows
```powershell
cd backend

# Schema changes
npm run db:generate            # Generate Prisma Client
npm run db:push                # Push schema (dev only)
npm run db:migrate             # Create migration (production-safe)

# Migrations
npx prisma migrate dev --name description_of_change
npx prisma migrate deploy      # Apply migrations (production)
```

### Testing Strategy
- **Unit tests**: `tests/unit/**/*.test.jsx` (Vitest + jsdom)
- **Integration tests**: `tests/integration/**/*.test.jsx`
- **E2E tests**: `tests/e2e/**/*.spec.js` (Playwright)
- **Coverage target**: 80% global, 90% for critical components
- **Run tests**: `npm test` (frontend), `npm run test` (backend)

## Design System (Dark Theme)

### Colors (Tailwind classes)
```jsx
// Backgrounds
<div className="bg-gray-800/50">      {/* Cards/sections */}
<div className="bg-gray-900">          {/* Page background */}

// Text
<span className="text-white">         {/* Primary text */}
<span className="text-gray-400">      {/* Secondary text */}
<span className="text-green-400">     {/* Success/positive */}
<span className="text-red-400">       {/* Errors/warnings */}
<span className="text-blue-400">      {/* Info/links */}

// Spacing: Use Tailwind scale (p-4, gap-6, m-8)
// Borders: rounded-xl (cards), rounded-lg (buttons/inputs)
// Font: Inter (default), font-bold for headings
```

### Component Patterns
```jsx
// Standard card component
<div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
  <h2 className="text-xl font-bold text-white mb-4">Başlık</h2>
  <p className="text-gray-400">İçerik</p>
</div>

// Button variants
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
  Kaydet
</button>

<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
  Sil
</button>
```

## External API Integration

### IGDB (Game Data)
- **Credentials**: Stored in `ApiKey` model with `serviceName: 'igdb'`
- **Flow**: Check DB cache → fetch from IGDB → cache with `cachedAt` timestamp
- **Endpoints**: `/api/games/search`, `/api/games/igdb/:id`
- **Rate limits**: Respect IGDB quotas, implement exponential backoff

### Steam/HLTB (Supplemental Data)
- **Steam**: User library imports, achievement data
- **HLTB**: Game completion times via `howlongtobeat-api` package
- **Storage**: Merged into `Game.steamData`, `Game.hltbData` JSON fields

### Cloudflare R2 (File Storage)
- **Upload flow**: Frontend → `/api/upload` → S3-compatible API → R2 bucket
- **Middleware**: `uploadAvatar`, `uploadGameCover` from `backend/src/middleware/upload.js`
- **Optimization**: Sharp for image resizing, WebP conversion
- **Access**: Pre-signed URLs via `@aws-sdk/s3-request-presigner`

## Common Tasks

### Critical Safety Rules
- **NEVER delete users** without explicit request and confirmation (CI blocked)
- **NEVER commit** without ensuring `elementRegistry.json` is up-to-date
- **ALWAYS ask** before making destructive database operations
- **ALWAYS check** file line count before committing (1200 line hard limit)

### Adding a New API Endpoint
1. Create route file: `backend/src/routes/[feature].js`
2. Add validation schema using `backend/src/lib/validationHelpers.js`
3. Implement with `jwtAuthMiddleware` or `hybridAuthMiddleware`
4. Add admin audit logging via `logAdminAction` if admin-only
5. Register in `backend/src/index.js` imports and `app.use()`
6. Update Swagger docs if `backend/src/routes/swagger.js` exists

### Adding a New React Page
1. Create component: `src/pages/[PageName].jsx`
2. Add ERS codes (`data-ers` attributes) to all interactive elements
3. Update `docs/ERS-REGISTRY.md` with new entries
4. Add route in `src/App.jsx` with `ProtectedRoute` or `AdminRoute`
5. Add to lazy imports with `React.lazy()` for code splitting
6. Update navigation in relevant `Header` or `Sidebar` components

### Campaign System (Multi-level Game Modes)
```javascript
// Create main campaign
const campaign = await prisma.campaign.create({
  data: {
    gameId: '12345',
    name: 'Ana Hikaye',
    isMainCampaign: true,
    averageDuration: '20 saat',
    difficulty: 'Normal'
  }
});

// Create sub-campaign (DLC, mode)
await prisma.campaign.create({
  data: {
    gameId: '12345',
    name: 'Yan Görev Paketi',
    parentId: campaign.id,
    isAutoGenerated: false
  }
});
```

### Session Tracking Flow
1. **Start**: `POST /api/sessions/start` with `{ gameId, gameName, campaigns, platform }`
2. **Active tracking**: `ActiveSessionContext` provides live timer, playtime updates
3. **End**: `POST /api/sessions/end` with `{ sessionId, campaigns }` updates `LibraryEntry.playtime`
4. **History**: Archived to `session_history` table for stats/analytics

## Troubleshooting

### Build Failures
- **Vite errors**: Check `vite.config.js` alias paths match actual structure
- **Prisma errors**: Run `npm run db:generate` in backend folder
- **ESLint errors**: Run `npm run lint -- --fix` then manually fix TypeScript-style issues

### Database Issues
- **Connection failures**: Verify `DATABASE_URL` in `backend/.env`
- **Migration conflicts**: Reset dev DB with `npm run db:reset` (destructive!)
- **Schema drift**: Compare `schema.prisma` with `npx prisma db pull` output

### Auth Problems
- **JWT verification fails**: Check `JWT_SECRET` consistency, token expiration (`JWT_EXPIRES_IN`)
- **Password hash mismatch**: Ensure `bcrypt` rounds match between register/login (default: 10)
- **Role checks**: `user.role === 'admin'` is case-sensitive

## Reference Documents
- **Architecture**: `docs/ARCHITECTURE.md` - System design, data flows, patterns
- **ERS Registry**: `docs/ERS-REGISTRY.md` - All UI element codes
- **Database Schema**: `backend/prisma/schema.prisma` - Complete data model
- **Coding Rules**: `CLAUDE_RULES.md` - Detailed workflows, standards, checklists
- **Deployment**: `docs/DEPLOYMENT.md` - Environment setup, production configs

## Language Notes
- **Code**: Always English (variables, functions, comments)
- **UI/UX**: Always Turkish (button labels, messages, placeholders)
- **Logs**: Turkish for user-facing, English for technical errors
- **Example**: `console.error('Oyun verisi alınamadı:', error)` → Turkish context, English error object
