---
name: e2e-review-1781166958461
description: E2E 自动审核测试：JSONPlaceholder 公开只读接口（GET，幂等无副作用）
metadata:
  xapi:
    dependencies:
      - service: e2e-review-1781166958461
        endpoint: get /posts/:postId
        required: true
        purpose: 获取单篇文章 — call via the xapi gateway
      - service: e2e-review-1781166958461
        endpoint: get /users/:userId
        required: true
        purpose: 获取用户 — call via the xapi gateway
      - service: e2e-review-1781166958461
        endpoint: get /posts4
        required: true
        purpose: 获取所有文章 — call via the xapi gateway
    permissions:
      externalWrites: false
      spendsCredits: false
      personalData: false
slug: e2e-review-1781166958461
version: 0.1.1
---

# E2E Review 1781166958461

E2E 自动审核测试：JSONPlaceholder 公开只读接口（GET，幂等无副作用）

## Auth

```bash
export XAPI_KEY=xapi_...
```

Gateway: `e2e-review-1781166958461.p.xapi.to` (prod) / `e2e-review-1781166958461.localhost:3001` (local).

## Endpoints

- `GET /posts/:postId` — 获取单篇文章
- `GET /users/:userId` — 获取用户
- `GET /posts4` — 获取所有文章

## Example

```bash
curl -sS "https://e2e-review-1781166958461.p.xapi.to/posts/:postId" \
  -H "xapi-key: $XAPI_KEY"
```
