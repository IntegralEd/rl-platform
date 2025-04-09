# 🔧 April 9 – Backend Redis Deployment Checklist

This checklist outlines the finalized Redis caching strategy and deployment plan for backend integration in the Recursive Learning platform.

---

## ✅ 1. Redis Engine & AWS Setup

- [x] Chose **Redis OSS** via ElastiCache (not Valkey or Memcached)
- [x] Set Redis cluster mode: **Disabled** (single-node for now)
- [x] Selected instance type: `t3.small`
- [x] Deployed within correct VPC & private subnet
- [x] Exposed to Lambda only via security group
- [x] Disabled public access

---

## ✅ 2. SSM Parameter Store Configuration

Stored the following values in AWS SSM:

| Name                     | Example                      |
|--------------------------|------------------------------|
| `/rl/redis/host`         | `redis.mycluster.amazonaws.com` |
| `/rl/redis/port`         | `6379`                       |
| `/rl/redis/username`     | `frontend` or `backend`      |
| `/rl/redis/password`     | Stored as `SecureString`     |

---

## ✅ 3. Lambda Integration Plan

- [x] Added AWS SDK calls to pull Redis credentials from SSM
- [x] Used `ioredis` to initialize the Redis client in Lambda
- [x] Created Redis key patterns for:
  - `user:{id}`, `page:{id}`, `org:{id}`, `token:{value}`
- [x] Implemented TTL:
  - Users = 6h, Pages = 1h, Orgs = 12h, Tokens = 10m

---

## ✅ 4. Test Coverage

- [x] **Ping test** returned `PONG` from Lambda
- [x] **Set/Get** confirmed working for all key types
- [x] TTL expiry confirmed via test TTL + rehydration

---

## ✅ 5. Schema Registry Updates

- [x] Scripting block used to update `Schema_Registry` table
- [x] Renamed fields are updated cleanly (uses Field_ID match)
- [x] Computed fields (like `Field_ID`, `Is_Linked_Field`) were updated to be writable (text/checkbox)

---

## ✅ 6. Roadmap Integration (In Progress)

- [ ] Add Redis key layer for:
  - `roadmap:phase:{n}`, `roadmap:release:{slug}`, `schema:table:{name}`
- [ ] Integrate `.mdc` checklist parser into Make flow
- [ ] Launch `roadmap.html` from doc index
