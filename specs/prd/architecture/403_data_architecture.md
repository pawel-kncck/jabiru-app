# 3. Data Architecture

## 3.1. Data Storage Strategy

```yaml
storage_tiers:
  hot_data:
    description: Frequently accessed data
    storage: Redis, In-memory cache
    ttl: 1-24 hours
    examples:
      - Active query results
      - User sessions
      - Real-time collaboration state

  warm_data:
    description: Recent operational data
    storage: PostgreSQL, MongoDB
    retention: 30-90 days
    examples:
      - Recent projects
      - Canvas content
      - User activity

  cold_data:
    description: Historical and archived data
    storage: S3/Blob Storage
    retention: 1+ years
    examples:
      - Archived projects
      - Historical analytics
      - Compliance logs

  analytical_data:
    description: Optimized for analytics
    storage: ClickHouse/BigQuery
    retention: 1 year
    examples:
      - Aggregated metrics
      - Usage analytics
      - Performance data
```

## 3.2. Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Ingestion │────▶│  Processing │────▶│   Storage   │────▶│   Serving   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │                    │
      ▼                    ▼                    ▼                    ▼
 • File Upload      • Validation        • PostgreSQL        • Query API
 • API Import       • Transformation    • MongoDB           • Cache Layer
 • Direct Connect   • Enrichment        • Object Storage    • CDN
 • Streaming        • Aggregation       • Analytics DB      • Export API
```

## 3.3. Database Design

For detailed database schemas and data models, see:

- [Data Model Specification](./05_data_model.md)
- [API Specifications](./06_api_specifications.md)