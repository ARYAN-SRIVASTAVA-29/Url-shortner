# System Design Interview Guide

## Overview
This guide helps you prepare for system design interviews using the LinkShort URL shortener as a comprehensive example. It covers key concepts, trade-offs, and scaling strategies commonly discussed in technical interviews.

## Interview Structure

### 1. Requirements Gathering (5-10 minutes)
**Functional Requirements:**
- Shorten long URLs to short, unique codes
- Redirect short URLs to original URLs
- Track click analytics (optional)
- User accounts and URL management (optional)

**Non-Functional Requirements:**
- Handle 100M URLs shortened per month
- 100:1 read-to-write ratio (more redirects than creations)
- 99.9% availability
- Minimal latency for redirects (<100ms)
- 10-year data retention

**Scale Estimation:**
- 100M URLs/month = ~40 URLs/second
- 10B redirects/month = ~4,000 redirects/second
- Storage: 100M URLs × 500 bytes = 50GB/month
- Bandwidth: 4,000 RPS × 500 bytes = 2MB/s

### 2. High-Level Design (10-15 minutes)

#### Basic Architecture
\`\`\`
[Client] → [Load Balancer] → [Web Servers] → [Database]
                                ↓
                           [Cache Layer]
\`\`\`

#### Core Components
1. **URL Shortening Service**: Generate unique short codes
2. **URL Resolution Service**: Redirect to original URLs
3. **Analytics Service**: Track and aggregate click data
4. **Database**: Store URL mappings and analytics
5. **Cache**: Fast access to popular URLs

### 3. Detailed Design (15-20 minutes)

#### Database Schema
\`\`\`sql
-- URLs table
CREATE TABLE urls (
  id UUID PRIMARY KEY,
  short_code VARCHAR(7) UNIQUE,
  original_url TEXT,
  user_id UUID,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Analytics table
CREATE TABLE clicks (
  id UUID PRIMARY KEY,
  url_id UUID REFERENCES urls(id),
  clicked_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(2)
);
\`\`\`

#### Short Code Generation Strategies

**Option 1: Base62 Encoding**
\`\`\`python
def encode_base62(num):
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    while num > 0:
        result = chars[num % 62] + result
        num //= 62
    return result
\`\`\`

**Option 2: Random Generation**
\`\`\`python
import random
import string

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))
\`\`\`

**Option 3: Counter-based with Base62**
- Use auto-incrementing counter
- Encode counter value to Base62
- Pros: Guaranteed uniqueness, predictable length
- Cons: Sequential patterns, single point of failure

#### API Design
\`\`\`
POST /api/shorten
{
  "original_url": "https://example.com/very/long/url",
  "custom_alias": "optional",
  "expires_at": "2024-12-31T23:59:59Z"
}

GET /{short_code}
→ 302 Redirect to original URL

GET /api/analytics/{short_code}
→ Click statistics and metrics
\`\`\`

### 4. Scale and Optimize (10-15 minutes)

#### Caching Strategy
\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │     CDN     │    │    Redis    │
│   Cache     │────│   Cache     │────│   Cache     │
│  (1 hour)   │    │  (1 day)    │    │ (1 week)    │
└─────────────┘    └─────────────┘    └─────────────┘
\`\`\`

**Cache Layers:**
1. **Browser Cache**: Cache redirects for 1 hour
2. **CDN Cache**: Global edge caching for popular URLs
3. **Application Cache**: Redis for frequently accessed URLs
4. **Database Cache**: Query result caching

#### Database Scaling

**Read Replicas:**
\`\`\`
[Write Master] → [Read Replica 1]
               → [Read Replica 2]
               → [Read Replica 3]
\`\`\`

**Sharding Strategies:**
1. **Hash-based**: Shard by short_code hash
2. **Range-based**: Shard by creation date
3. **Geographic**: Shard by user location

**Partitioning:**
\`\`\`sql
-- Partition analytics by date
CREATE TABLE clicks_2024_01 PARTITION OF clicks
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
\`\`\`

#### Microservices Architecture
\`\`\`
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  URL Shortener  │  │  URL Resolver   │  │   Analytics     │
│    Service      │  │    Service      │  │    Service      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │   Message       │
                    │   Queue         │
                    └─────────────────┘
\`\`\`

### 5. Additional Considerations (5-10 minutes)

#### Security
- **Rate Limiting**: Prevent abuse and spam
- **URL Validation**: Sanitize and validate input URLs
- **Malware Detection**: Scan URLs for malicious content
- **Access Control**: User authentication and authorization

#### Monitoring and Analytics
- **Metrics**: Response time, error rates, throughput
- **Logging**: Structured logging with correlation IDs
- **Alerting**: Automated notifications for issues
- **Dashboards**: Real-time system health monitoring

#### Data Consistency
- **Eventual Consistency**: Accept temporary inconsistencies for performance
- **Strong Consistency**: Use for critical operations (URL creation)
- **Conflict Resolution**: Handle duplicate short codes gracefully

## Common Interview Questions

### Q: How do you handle duplicate short codes?
**A:** Multiple strategies:
1. **Retry Logic**: Generate new code if collision detected
2. **Pre-generated Pool**: Maintain pool of unused codes
3. **Distributed Counters**: Use multiple counter ranges
4. **Probabilistic**: Accept very low collision probability

### Q: How do you ensure high availability?
**A:** 
- **Multi-region deployment**: Deploy across multiple AWS regions
- **Load balancing**: Distribute traffic across healthy instances
- **Circuit breakers**: Fail fast when dependencies are down
- **Graceful degradation**: Serve cached data when database is unavailable

### Q: How do you handle hot URLs?
**A:**
- **CDN caching**: Cache popular URLs at edge locations
- **Application caching**: Use Redis with LRU eviction
- **Database read replicas**: Distribute read load
- **Preemptive caching**: Cache URLs before they become hot

### Q: How do you scale analytics?
**A:**
- **Asynchronous processing**: Use message queues for click events
- **Batch processing**: Aggregate analytics in batches
- **Separate database**: Use dedicated analytics database
- **Data warehousing**: Use columnar databases for analytics

### Q: How do you handle URL expiration?
**A:**
- **TTL in cache**: Set cache expiration based on URL expiration
- **Background cleanup**: Periodic job to remove expired URLs
- **Lazy deletion**: Check expiration during access
- **Soft deletion**: Mark as expired instead of deleting

## Trade-offs Discussion

### Consistency vs. Availability
- **Strong Consistency**: Ensures no duplicate short codes but may impact availability
- **Eventual Consistency**: Better availability but may have temporary inconsistencies

### SQL vs. NoSQL
- **SQL (PostgreSQL)**: ACID properties, complex queries, mature ecosystem
- **NoSQL (DynamoDB)**: Better horizontal scaling, simpler data model, eventual consistency

### Synchronous vs. Asynchronous
- **Synchronous**: Immediate feedback, simpler error handling
- **Asynchronous**: Better performance, more complex error handling

### Caching Strategies
- **Write-through**: Consistent but slower writes
- **Write-behind**: Faster writes but risk of data loss
- **Cache-aside**: Flexible but requires careful invalidation

## Advanced Topics

### Custom Domains
- **DNS Configuration**: CNAME records pointing to service
- **SSL Certificates**: Automatic certificate provisioning
- **Subdomain Routing**: Route based on subdomain

### API Rate Limiting
\`\`\`python
# Token bucket algorithm
class RateLimiter:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
    
    def allow_request(self):
        self._refill()
        if self.tokens > 0:
            self.tokens -= 1
            return True
        return False
\`\`\`

### Geographic Distribution
- **Multi-region deployment**: Reduce latency for global users
- **Data replication**: Sync data across regions
- **Conflict resolution**: Handle concurrent updates

### Machine Learning Integration
- **Fraud Detection**: Identify malicious URLs
- **Recommendation Engine**: Suggest related URLs
- **Predictive Caching**: Cache URLs before they become popular

## Preparation Tips

### Before the Interview
1. **Practice drawing**: Be comfortable with whiteboarding
2. **Know the numbers**: Memorize common system design numbers
3. **Study real systems**: Understand how bit.ly, TinyURL work
4. **Practice trade-offs**: Be ready to discuss pros/cons

### During the Interview
1. **Ask clarifying questions**: Understand requirements fully
2. **Start simple**: Begin with basic design, then add complexity
3. **Think out loud**: Explain your reasoning
4. **Consider trade-offs**: Discuss alternatives and their implications
5. **Be realistic**: Acknowledge limitations and areas for improvement

### Common Mistakes to Avoid
1. **Jumping to details**: Start with high-level design first
2. **Over-engineering**: Don't add unnecessary complexity
3. **Ignoring scale**: Consider the scale from the beginning
4. **Not asking questions**: Clarify ambiguous requirements
5. **Forgetting non-functional requirements**: Consider availability, consistency, performance

## Resources for Further Study

### Books
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "System Design Interview" by Alex Xu
- "Building Microservices" by Sam Newman

### Online Resources
- High Scalability blog
- AWS Architecture Center
- Google Cloud Architecture Framework
- System Design Primer (GitHub)

### Practice Platforms
- Pramp
- InterviewBit
- LeetCode System Design
- Educative.io System Design Course
