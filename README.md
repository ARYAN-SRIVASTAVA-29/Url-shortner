# LinkShort - Enterprise URL Shortener System

A comprehensive URL shortening service built with Next.js, Supabase, and modern web technologies. This project demonstrates enterprise-grade system design principles, scalable architecture, and professional development practices.

## 🏗️ System Architecture

### High-Level Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Next.js App   │────│   Supabase DB   │
│   (Vercel Edge) │    │   (App Router)   │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Optional)    │
                       └─────────────────┘
\`\`\`

### Core Components
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with server-side rendering
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **Analytics**: Real-time click tracking and visualization
- **Deployment**: Vercel with global CDN distribution

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Vercel account (for deployment)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase integration in v0 Project Settings
4. Run database migrations from the `scripts/` folder
5. Start development server: `npm run dev`

### Database Setup
Execute the SQL scripts in order:
1. `scripts/001_create_tables.sql` - Core table structure
2. `scripts/002_create_rls_policies.sql` - Security policies
3. `scripts/003_create_functions.sql` - Utility functions
4. `scripts/004_seed_sample_data.sql` - Sample data (optional)

## 📊 Features

### Core Functionality
- **URL Shortening**: Generate unique short codes for long URLs
- **Custom Analytics**: Track clicks, geographic data, referrers
- **User Management**: Authentication and personal dashboards
- **Real-time Redirects**: Fast URL resolution with analytics tracking

### Advanced Features
- **Row Level Security**: Database-level access control
- **Geographic Analytics**: Country and city-level click tracking
- **Device Detection**: Browser and device type identification
- **Batch Operations**: Bulk URL management
- **API Integration**: RESTful API for external integrations

## 🔧 System Design Decisions

### Database Schema
- **Normalized Design**: Separate tables for users, URLs, and clicks
- **UUID Primary Keys**: Globally unique identifiers for scalability
- **Indexed Columns**: Optimized queries for short_code lookups
- **Audit Trails**: Created/updated timestamps for all records

### Security Implementation
- **Row Level Security (RLS)**: User data isolation at database level
- **Authentication Middleware**: Server-side session management
- **Input Validation**: URL format validation and sanitization
- **CORS Protection**: Secure cross-origin request handling

### Performance Optimizations
- **Database Indexing**: Optimized queries for URL resolution
- **Connection Pooling**: Efficient database connection management
- **CDN Distribution**: Global edge caching via Vercel
- **Lazy Loading**: Component-level code splitting

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Architecture**: No server-side session storage
- **Database Sharding**: Partition by user_id or short_code
- **Read Replicas**: Separate read/write database instances
- **Microservices**: Split analytics and URL services

### Caching Strategy
- **Redis Integration**: Cache frequently accessed URLs
- **CDN Caching**: Static asset and API response caching
- **Browser Caching**: Client-side URL resolution caching
- **Database Query Caching**: Supabase built-in query optimization

### Monitoring & Observability
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and throughput monitoring
- **Analytics Dashboard**: Real-time system health metrics
- **Alerting**: Automated notifications for system issues

## 🔒 Security Features

### Data Protection
- **Encryption at Rest**: Supabase automatic encryption
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Access Control**: Role-based permissions system
- **Data Validation**: Server-side input sanitization

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Email Verification**: Account activation workflow
- **Password Security**: Bcrypt hashing with salt
- **Session Management**: Automatic token refresh

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - Session termination

### URL Management Endpoints
- `POST /api/shorten` - Create shortened URL
- `GET /api/urls` - List user URLs
- `PATCH /api/urls/[id]` - Update URL metadata
- `DELETE /api/urls/[id]` - Delete URL

### Analytics Endpoints
- `GET /api/analytics/[id]` - URL-specific analytics
- `GET /api/analytics/overview` - Account-wide analytics

### Redirect Endpoint
- `GET /[shortCode]` - URL resolution and redirect

## 🎯 Interview Preparation Guide

### System Design Topics Covered
1. **Database Design**: Schema normalization, indexing, RLS
2. **API Design**: RESTful principles, error handling
3. **Scalability**: Horizontal scaling, caching strategies
4. **Security**: Authentication, authorization, data protection
5. **Performance**: Query optimization, CDN usage
6. **Monitoring**: Analytics, error tracking, alerting

### Key Discussion Points
- **Trade-offs**: Consistency vs. availability in URL resolution
- **Scaling**: Handling millions of URLs and redirects
- **Security**: Preventing abuse and malicious URLs
- **Analytics**: Real-time vs. batch processing considerations
- **Reliability**: Fault tolerance and disaster recovery

### Architecture Decisions
- **Why Supabase**: Managed PostgreSQL with built-in auth
- **Why Next.js**: Full-stack framework with SSR capabilities
- **Why Row Level Security**: Database-level access control
- **Why UUID**: Global uniqueness for distributed systems

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set up Supabase integration
4. Deploy with automatic CI/CD

### Environment Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Production Considerations
- **Domain Configuration**: Custom domain setup
- **SSL Certificates**: Automatic HTTPS via Vercel
- **Database Backups**: Automated Supabase backups
- **Monitoring**: Vercel Analytics integration

## 📖 Study Resources

### System Design Concepts
- **Load Balancing**: Distributing traffic across servers
- **Database Sharding**: Horizontal database partitioning
- **Caching Strategies**: Redis, CDN, browser caching
- **Microservices**: Service decomposition patterns

### Technology Deep Dives
- **PostgreSQL**: Advanced querying and optimization
- **Next.js**: Server-side rendering and API routes
- **Supabase**: Real-time subscriptions and RLS
- **Vercel**: Edge functions and global deployment

## 🤝 Contributing

This project serves as a learning resource for system design interviews. Contributions that enhance the educational value are welcome.

## 📄 License

MIT License - See LICENSE file for details.

---

**Built for System Design Interview Preparation**
This project demonstrates enterprise-grade architecture patterns, scalable design principles, and modern web development practices suitable for technical interviews and real-world applications.
