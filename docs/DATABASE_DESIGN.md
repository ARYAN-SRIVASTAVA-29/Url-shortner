# Database Design Documentation

## Schema Overview

The LinkShort database is designed with scalability, security, and performance in mind. It uses PostgreSQL through Supabase with Row Level Security (RLS) for data protection.

## Entity Relationship Diagram

\`\`\`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      users      │────▶│      urls       │────▶│     clicks      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │     │ id (UUID) PK    │     │ id (UUID) PK    │
│ email           │     │ short_code      │     │ url_id (FK)     │
│ created_at      │     │ original_url    │     │ clicked_at      │
│ updated_at      │     │ user_id (FK)    │     │ ip_address      │
└─────────────────┘     │ title           │     │ user_agent      │
                        │ description     │     │ referer         │
                        │ created_at      │     │ country         │
                        │ updated_at      │     │ city            │
                        │ expires_at      │     │ device_type     │
                        │ is_active       │     │ browser         │
                        └─────────────────┘     └─────────────────┘
\`\`\`

## Table Specifications

### users Table
Extends Supabase's built-in auth.users table with additional profile information.

\`\`\`sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Design Decisions:**
- Uses UUID for global uniqueness and scalability
- References auth.users with CASCADE delete for data consistency
- Minimal profile data to start, extensible for future features

### urls Table
Core table storing URL mappings and metadata.

\`\`\`sql
CREATE TABLE public.urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);
\`\`\`

**Design Decisions:**
- `short_code` is VARCHAR(10) to support various encoding schemes
- `user_id` is nullable to support anonymous URL creation
- `expires_at` allows for temporary URLs
- `is_active` enables soft deletion and URL management

### clicks Table
Analytics table tracking URL access patterns.

\`\`\`sql
CREATE TABLE public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID NOT NULL REFERENCES public.urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(2),
  city TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50)
);
\`\`\`

**Design Decisions:**
- Separate table for analytics to avoid bloating urls table
- INET type for efficient IP address storage
- Geographic data for location-based analytics
- Device/browser detection for user experience insights

## Indexing Strategy

### Primary Indexes
\`\`\`sql
-- Automatic primary key indexes
CREATE UNIQUE INDEX users_pkey ON users(id);
CREATE UNIQUE INDEX urls_pkey ON urls(id);
CREATE UNIQUE INDEX clicks_pkey ON clicks(id);
\`\`\`

### Performance Indexes
\`\`\`sql
-- Fast URL resolution
CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);

-- User URL queries
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_user_created ON urls(user_id, created_at DESC);

-- Analytics queries
CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_url_date ON clicks(url_id, clicked_at);
\`\`\`

### Composite Indexes
\`\`\`sql
-- User dashboard queries
CREATE INDEX idx_urls_user_active ON urls(user_id, is_active, created_at DESC);

-- Analytics time-series queries
CREATE INDEX idx_clicks_analytics ON clicks(url_id, clicked_at DESC, country);
\`\`\`

## Row Level Security (RLS)

### Security Policies

#### Users Table Policies
\`\`\`sql
-- Users can only access their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
\`\`\`

#### URLs Table Policies
\`\`\`sql
-- Users can manage their own URLs
CREATE POLICY "urls_select_own" ON urls
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "urls_insert_own" ON urls
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "urls_update_own" ON urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "urls_delete_own" ON urls
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for URL resolution
CREATE POLICY "urls_public_read" ON urls
  FOR SELECT USING (is_active = true);
\`\`\`

#### Clicks Table Policies
\`\`\`sql
-- Users can view analytics for their URLs
CREATE POLICY "clicks_select_own_urls" ON clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM urls 
      WHERE urls.id = clicks.url_id 
      AND urls.user_id = auth.uid()
    )
  );

-- Anyone can create click records (for tracking)
CREATE POLICY "clicks_insert_public" ON clicks
  FOR INSERT WITH CHECK (true);
\`\`\`

## Database Functions

### Short Code Generation
\`\`\`sql
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
\`\`\`

### User Profile Creation Trigger
\`\`\`sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
\`\`\`

### Analytics Aggregation Function
\`\`\`sql
CREATE OR REPLACE FUNCTION get_url_analytics(url_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clicks', COUNT(*),
    'unique_ips', COUNT(DISTINCT ip_address),
    'clicks_today', COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE),
    'clicks_this_week', COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE - INTERVAL '7 days'),
    'top_countries', (
      SELECT json_agg(json_build_object('country', country, 'count', count))
      FROM (
        SELECT country, COUNT(*) as count
        FROM clicks
        WHERE url_id = url_uuid AND country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5
      ) t
    )
  )
  INTO result
  FROM clicks
  WHERE url_id = url_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

## Data Migration Strategy

### Version Control
- All schema changes are versioned in numbered SQL files
- Each migration includes both UP and DOWN operations
- Migrations are idempotent and can be safely re-run

### Migration Files Structure
\`\`\`
scripts/
├── 001_create_tables.sql
├── 002_create_rls_policies.sql
├── 003_create_functions.sql
├── 004_seed_sample_data.sql
└── migrations/
    ├── 005_add_custom_domains.sql
    ├── 006_add_bulk_operations.sql
    └── 007_add_api_keys.sql
\`\`\`

## Performance Considerations

### Query Optimization
1. **URL Resolution**: Single index lookup on short_code
2. **User Dashboards**: Composite index on user_id + created_at
3. **Analytics**: Time-series optimized indexes
4. **Bulk Operations**: Batch inserts with COPY command

### Scaling Strategies
1. **Read Replicas**: Separate analytics queries from transactional
2. **Partitioning**: Partition clicks table by date
3. **Archiving**: Move old clicks data to cold storage
4. **Sharding**: Horizontal partitioning by user_id or geography

### Connection Management
1. **Connection Pooling**: PgBouncer configuration
2. **Connection Limits**: Optimal pool sizing
3. **Query Timeout**: Prevent long-running queries
4. **Prepared Statements**: Reduce parsing overhead

## Backup and Recovery

### Backup Strategy
1. **Continuous Backup**: Point-in-time recovery capability
2. **Daily Snapshots**: Full database backups
3. **Cross-Region Replication**: Disaster recovery
4. **Data Export**: Regular CSV exports for compliance

### Recovery Procedures
1. **Point-in-Time Recovery**: Restore to specific timestamp
2. **Table-Level Recovery**: Restore individual tables
3. **Data Validation**: Verify data integrity after recovery
4. **Rollback Procedures**: Safe migration rollback process

## Monitoring and Maintenance

### Performance Monitoring
1. **Query Performance**: Slow query identification
2. **Index Usage**: Unused index detection
3. **Connection Metrics**: Pool utilization monitoring
4. **Storage Growth**: Capacity planning

### Maintenance Tasks
1. **VACUUM**: Regular table maintenance
2. **ANALYZE**: Statistics updates
3. **REINDEX**: Index rebuilding
4. **Archive**: Old data cleanup

## Future Enhancements

### Schema Evolution
1. **Custom Domains**: Additional domain management tables
2. **API Keys**: Authentication token management
3. **Teams**: Multi-user organization support
4. **Webhooks**: Event notification system

### Performance Improvements
1. **Materialized Views**: Pre-computed analytics
2. **Partitioning**: Time-based table partitioning
3. **Compression**: Column-level compression
4. **Caching**: Query result caching
