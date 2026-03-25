# Insphire API Integration Documentation

**Status**: 🔴 Pending - Needs completion  
**Owner**: [Your Name]  
**Last Updated**: November 19, 2025

---

## 1. API Access

### Authentication
- [ ] **API Key obtained**: _______________
- [ ] **Authentication method**: Bearer Token / API Key / OAuth
- [ ] **Key storage location**: Environment variable / Secrets manager
- [ ] **Key refresh required**: Yes / No
- [ ] **Refresh frequency**: _______________

### Environments
| Environment | Base URL | Status |
|-------------|----------|--------|
| Development | https://api-dev.insphire.com | [ ] Tested |
| Staging     | https://api-staging.insphire.com | [ ] Tested |
| Production  | https://api.insphire.com | [ ] Not accessed yet |

### Rate Limits
- **Requests per minute**: _______________
- **Requests per hour**: _______________
- **Concurrent requests**: _______________
- **Throttling behavior**: _______________

---

## 2. Product Catalog Endpoint

### Endpoint Details
```
GET /api/v1/products
```

**Base URL**: _______________

**Headers Required**:
```http
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| category | string | No | Filter by category | "fence" |
| material | string | No | Filter by material | "wood" |
| page | number | No | Pagination | 1 |
| limit | number | No | Results per page | 50 |

### Sample Request
```bash
curl -X GET "https://api.insphire.com/api/v1/products?category=fence&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Sample Response
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "prod_12345",
        "sku": "FENCE-POST-W-2.1",
        "name": "Wooden Fence Post 2.1m",
        "category": "fence_posts",
        "material": "wood",
        "dimensions": {
          "height": 2.1,
          "width": 0.1,
          "depth": 0.1,
          "unit": "meters"
        },
        "price": {
          "amount": 1499,
          "currency": "ISK",
          "unit": "per_piece"
        },
        "stock": {
          "available": true,
          "quantity": 150
        },
        "metadata": {
          "weight": 5.2,
          "treatment": "pressure_treated"
        }
      }
    ],
    "pagination": {
      "total": 127,
      "page": 1,
      "pages": 3,
      "limit": 50
    }
  }
}
```

**Response Fields Documentation**:
| Field Path | Type | Description | Notes |
|------------|------|-------------|-------|
| data.products[].id | string | Unique product identifier | Use for referencing |
| data.products[].sku | string | Stock keeping unit | May differ from internal SKU |
| data.products[].price.amount | number | Price in smallest currency unit | ISK in aurar (1kr = 100 aurar) |
| ... | ... | ... | ... |

---

## 3. Pricing Endpoint

### Endpoint Details
```
POST /api/v1/pricing/calculate
```

**Purpose**: Get real-time pricing for multiple products

**Request Body**:
```json
{
  "products": [
    {
      "id": "prod_12345",
      "quantity": 5
    },
    {
      "id": "prod_67890",
      "quantity": 10
    }
  ],
  "customer_type": "retail" // or "wholesale"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "product_id": "prod_12345",
        "quantity": 5,
        "unit_price": 1499,
        "subtotal": 7495,
        "tax": 1499,
        "total": 8994
      }
    ],
    "summary": {
      "subtotal": 12990,
      "tax": 2598,
      "total": 15588,
      "currency": "ISK"
    }
  }
}
```

---

## 4. Error Handling

### Common Error Codes
| Code | Message | Meaning | Resolution |
|------|---------|---------|------------|
| 401 | Unauthorized | Invalid API key | Check authentication |
| 403 | Forbidden | Access denied | Verify permissions |
| 404 | Not Found | Product doesn't exist | Check product ID |
| 429 | Too Many Requests | Rate limit exceeded | Implement backoff |
| 500 | Internal Server Error | API issue | Retry with exponential backoff |

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 'prod_12345' does not exist",
    "details": {
      "product_id": "prod_12345"
    }
  }
}
```

---

## 5. Data Mapping

### Insphire → BYKO Product Mapping

| Insphire Field | BYKO Field | Transformation |
|----------------|------------|----------------|
| `id` | `externalId` | Direct mapping |
| `sku` | `variants[0].sku` | May need prefix |
| `price.amount` | `price.value.amount` | Convert from aurar to ISK (÷100) |
| `dimensions.height` | `meta.size` | Unit conversion if needed |

### Example Adapter
```typescript
interface InsphireProduct {
  id: string;
  sku: string;
  name: string;
  price: {
    amount: number;
    currency: string;
  };
}

interface BykoProduct {
  id: number;
  variants: Array<{
    sku: string;
  }>;
  price: {
    value: {
      amount: number;
    };
  };
}

function mapInsphireToByko(insphire: InsphireProduct): Partial<BykoProduct> {
  return {
    // Map fields here
    id: parseInt(insphire.id.replace('prod_', '')),
    variants: [{
      sku: insphire.sku
    }],
    price: {
      value: {
        amount: insphire.price.amount / 100 // Convert aurar to ISK
      }
    }
  };
}
```

---

## 6. Integration Strategy

### Approach 1: Full Replacement
- Replace all product fetching with Insphire API
- **Pros**: Single source of truth
- **Cons**: Dependency on external service

### Approach 2: Hybrid (Recommended)
- Use BYKO database for product IDs and metadata
- Fetch pricing from Insphire in real-time
- **Pros**: Resilient to API failures
- **Cons**: Need to keep data in sync

### Approach 3: Cache with Refresh
- Fetch from Insphire, cache locally
- Refresh cache every X minutes
- **Pros**: Fast performance, lower API usage
- **Cons**: Slightly stale data

**Recommended**: Approach 2 (Hybrid)

---

## 7. Implementation Checklist

- [ ] API access confirmed and tested
- [ ] Sample requests working in Postman
- [ ] Error handling tested (invalid key, wrong product ID)
- [ ] Rate limiting understood and documented
- [ ] Data mapping defined
- [ ] Adapter functions written
- [ ] Fallback strategy defined (what if API is down?)
- [ ] Caching strategy defined
- [ ] Monitoring/logging plan
- [ ] Security review (API key storage)

---

## 8. Test Data

### Test Product IDs
| Product Type | Insphire ID | BYKO ID | Notes |
|--------------|-------------|---------|-------|
| Fence Post 2.1m | prod_12345 | 248067 | Test product |
| Fence Panel Wood | prod_67890 | 248063 | Test product |
| Gate Hardware | prod_54321 | 302906 | Test product |

### Test Scenarios
```typescript
// Test 1: Simple product fetch
const response = await fetch('https://api.insphire.com/api/v1/products/prod_12345', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
// Expected: 200 OK with product data

// Test 2: Invalid product ID
const response = await fetch('https://api.insphire.com/api/v1/products/prod_INVALID', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
// Expected: 404 Not Found

// Test 3: Rate limiting
for (let i = 0; i < 100; i++) {
  await fetch('https://api.insphire.com/api/v1/products');
}
// Expected: 429 Too Many Requests at some point
```

---

## 9. Questions for Insphire Support

- [ ] What is the SLA/uptime guarantee?
- [ ] Is there a webhook for product updates?
- [ ] How often does pricing data change?
- [ ] Are there bulk endpoints for fetching multiple products?
- [ ] What's the recommended caching strategy?
- [ ] Is there a staging environment for testing?
- [ ] How do we handle product deprecation/removal?

---

## 10. Contact Information

**Insphire API Support**:
- Email: _______________
- Slack: _______________
- Documentation: _______________
- Status Page: _______________

**Internal Contacts**:
- API Key Owner: _______________
- Technical Lead: _______________
- Product Owner: _______________

---

## Next Steps

1. [ ] Get API credentials from Insphire
2. [ ] Test product catalog endpoint
3. [ ] Test pricing endpoint
4. [ ] Map 5 sample products
5. [ ] Create adapter functions
6. [ ] Review with senior developer
7. [ ] Implement error handling
8. [ ] Add monitoring/logging

---

**Notes**:
- Add any additional findings here
- Document any API quirks or unexpected behavior
- Keep this document updated as integration progresses
