# Jun-Oro Database Migration Plan

# Cloudflare API (SQLite/D1) → PostgreSQL (Unified Schema)

## 🎯 MIGRATION HEDEFİ

- **Source**: Cloudflare API SQLite/D1 database
- **Target**: PostgreSQL with unified Prisma schema
- **Goal**: Zero data loss, minimal downtime, backward compatibility

## 📋 MIGRATION PHASES

### Phase 1: Preparation (Güvenlik Önceliği)

1. **Backup Creation**
   - Cloudflare D1 database full backup
   - PostgreSQL current database backup
   - Migration rollback script'leri hazırla

2. **Environment Setup**
   - Test PostgreSQL database oluştur
   - Connection string'leri yapılandır
   - Prisma client'ını test et

### Phase 2: Schema Migration

1. **Create Unified Schema**
   - ✅ `unified-schema.prisma` oluşturuldu
   - Migration files oluştur
   - Index'leri oluştur

2. **Schema Validation**
   - Data type uyumluluğu kontrolü
   - Constraint'leri doğrula
   - Relationship integrity test

### Phase 3: Data Migration (KRİTİK)

1. **User Data Migration**

   ```sql
   -- SQLite → PostgreSQL User Migration
   -- ID Format: INTEGER → cuid() (generate new cuid for each user)
   -- Preserve: username, email, password_hash, role, bio
   ```

2. **Game Data Migration**

   ```sql
   -- SQLite → PostgreSQL Game Migration
   -- ID Format: INTEGER → cuid() (generate new cuid for each game)
   -- Preserve: title, description, genre, platforms, etc.
   -- Map: title → name, image_url → cover, etc.
   ```

3. **Relationship Migration**
   ```sql
   -- User-Game Relationships
   -- Map old IDs to new IDs
   -- Preserve: ratings, playtime, status
   ```

### Phase 4: Cloudflare API Code Migration

1. **Replace Raw SQL with Prisma**
   - Install Prisma in cloudflare-api2
   - Replace all `env.DB.prepare()` calls
   - Update authentication logic

2. **Update API Responses**
   - Standardize response formats
   - Maintain backward compatibility

### Phase 5: Testing & Validation

1. **Data Integrity Tests**
   - Record count validation
   - Relationship integrity checks
   - Data format validation

2. **API Functionality Tests**
   - All endpoints çalıştırma
   - Response format kontrolü
   - Performance benchmarking

## 🔧 TECHNICAL IMPLEMENTATION

### Migration Scripts Structure

```
migration/
├── 01-backup-databases.js
├── 02-create-unified-schema.js
├── 03-migrate-users.js
├── 04-migrate-games.js
├── 05-migrate-relationships.js
├── 06-validate-data.js
├── 07-update-cloudflare-api.js
└── 08-rollback-plan.js
```

### ID Mapping Strategy

```javascript
// Old SQLite ID → New PostgreSQL CUID mapping
const idMapping = {
  users: new Map(), // old_int_id → new_cuid_id
  games: new Map(), // old_int_id → new_cuid_id
  sessions: new Map(), // old_int_id → new_cuid_id
};
```

### Data Transformation Rules

```javascript
// User data transformation
const transformUser = (sqliteUser) => ({
  id: generateCuid(),
  name: sqliteUser.username,
  username: sqliteUser.username,
  email: sqliteUser.email,
  password: sqliteUser.password_hash,
  role: sqliteUser.role,
  bio: sqliteUser.bio,
  isActive: sqliteUser.is_active,
  createdAt: sqliteUser.created_at,
  updatedAt: sqliteUser.updated_at,
  lastLogin: sqliteUser.last_login,
});

// Game data transformation
const transformGame = (sqliteGame) => ({
  id: generateCuid(),
  name: sqliteGame.title,
  description: sqliteGame.description,
  genres: sqliteGame.genre ? [sqliteGame.genre] : [],
  platforms: sqliteGame.platform ? [sqliteGame.platform] : [],
  rating: sqliteGame.rating,
  cover: sqliteGame.image_url,
  status: sqliteGame.status,
  createdBy: sqliteGame.created_by,
  metadata: sqliteGame.metadata,
  createdAt: sqliteGame.created_at,
  updatedAt: sqliteGame.updated_at,
});
```

## ⚠️ RISK MITIGATION

### Data Loss Prevention

1. **Multiple Backups**
   - Before migration
   - After each phase
   - Automated backup verification

2. **Rollback Strategy**
   - Point-in-time recovery
   - Service continuity plan
   - Data validation checkpoints

### Downtime Minimization

1. **Blue-Green Deployment**
   - Keep old system running
   - Migrate data in background
   - Switch traffic gradually

2. **Feature Flags**
   - Enable/disable migration features
   - Gradual rollout
   - Instant rollback capability

## 📊 MIGRATION METRICS

### Success Criteria

- [ ] 100% data integrity (no data loss)
- [ ] < 5 minutes downtime
- [ ] All API endpoints functional
- [ ] Performance < 200ms response time
- [ ] Zero security vulnerabilities

### Monitoring

- Real-time data sync status
- API response times
- Error rates
- Database performance metrics

## 🚀 EXECUTION TIMELINE

### Day 1: Preparation

- Backup creation
- Environment setup
- Migration scripts ready

### Day 2: Migration

- Schema deployment
- Data migration (batch processing)
- Code updates

### Day 3: Testing

- Data validation
- API testing
- Performance optimization

### Day 4: Deployment

- Production deployment
- Monitoring setup
- Documentation update

## 📝 POST-MIGRATION TASKS

1. **Cleanup**
   - Remove old SQLite files
   - Update documentation
   - Archive migration scripts

2. **Optimization**
   - Database indexing
   - Query optimization
   - Caching strategy

3. **Monitoring**
   - Set up alerts
   - Performance dashboards
   - Health checks

## 🔐 SECURITY CONSIDERATIONS

1. **Credential Management**
   - Update database connection strings
   - Rotate API keys
   - Update environment variables

2. **Access Control**
   - Review database permissions
   - Update firewall rules
   - Audit trail setup

## 📞 EMERGENCY CONTACTS

- Database Administrator: [Contact]
- DevOps Team: [Contact]
- Project Lead: [Contact]
- Security Team: [Contact]

---

**NOT**: Bu migration planı sıfır data loss ve minimum downtime hedefler. Her phase sonunda validation checkpoint'leri var. Emergency rollback planı hazır durumda.
