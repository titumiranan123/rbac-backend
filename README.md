# RBAC Backend

Role-Based Access Control System with NestJS + Prisma + Zod

## Tech Stack

- **Framework:** NestJS
- **ORM:** Prisma
- **Validation:** Zod
- **Database:** PostgreSQL
- **Authentication:** JWT (No Passport)

## Features

### Authentication
- JWT Access Token (15 min expiry, stored in memory)
- Refresh Token (7 days, httpOnly cookie)
- Session Blacklist (logout invalidates refresh token)
- Brute-force Protection (5 failed attempts → 15 min block)

### Role Management
- 4 Roles: Admin, Manager, Agent, Customer
- Role Hierarchy: Admin (0) > Manager (1) > Agent (2) > Customer (3)
- Hierarchy-based permissions (upper role manages lower)

### Permission System
- Dynamic Permission Atoms (21 predefined permissions)
- Grant Ceiling Enforce (can't grant permissions you don't have)
- Permission-based access control (not role-based routing)

### User Lifecycle
- Create, Read, Update, Delete (CRUD)
- Suspend (Admin/Manager)
- Ban (Admin only)
- Activate (Admin/Manager)

### Security
- Rate Limiting (100 requests per 15 min)
- Password Hashing (bcrypt, 10 rounds)
- Append-only Audit Log (no delete)
- CORS enabled for frontend

### Modules
- Dashboard
- Users (CRUD + permissions)
- Leads (stub)
- Tasks (stub)
- Reports (stub)
- Audit Log (append-only)
- Customer Portal (tickets & orders)
- Settings (stub)

## Role Hierarchy

```
Admin (0) > Manager (1) > Agent (2) > Customer (3)
```

| Role | Can Manage | Special |
|------|------------|---------|
| Admin | All roles | Full access, can ban |
| Manager | Agent, Customer | Can suspend/activate |
| Agent | Customer | Limited access |
| Customer | - | Customer Portal only |

## Permission Atoms

```
view_dashboard, view_users, create_user, edit_user, delete_user
suspend_user, ban_user, view_leads, create_lead, edit_lead, delete_lead
view_tasks, create_task, edit_task, delete_task, view_reports
view_audit_log, view_settings, view_customer_portal, view_orders, view_tickets
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

**.env example:**
```env
DATABASE_URL="postgresql://user:password@localhost:5433/rbac_db"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed default permissions (optional)
curl -X POST http://localhost:3000/api/permissions/seed \
  -H "Authorization: Bearer <admin_token>"
```

### 4. Run Server

```bash
# Development
npm run start:dev

# Production
npm run build
node dist/src/main.js
```

## Default Admin

- **Email:** admin@system.com
- **Password:** Admin@123

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login user |
| POST | /api/auth/refresh | Public | Refresh access token (cookie) |
| POST | /api/auth/logout | Protected | Logout + blacklist token |
| GET | /api/auth/me | Protected | Get current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users | Admin/Manager | List all users (paginated) |
| GET | /api/users/:id | Admin/Manager | Get user by ID |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:id | Admin/Manager | Update user |
| DELETE | /api/users/:id | Admin | Delete user |
| PATCH | /api/users/:id/suspend | Admin/Manager | Suspend user |
| PATCH | /api/users/:id/ban | Admin | Ban user |
| PATCH | /api/users/:id/activate | Admin/Manager | Activate user |
| POST | /api/users/:id/role | Admin | Assign role |
| POST | /api/users/:id/permissions/:permission | Admin/Manager | Grant permission* |
| DELETE | /api/users/:id/permissions/:permission | Admin/Manager | Revoke permission* |

*Grant Ceiling enforced - granter must have the permission

### Roles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/roles | Admin/Manager | List all roles |
| GET | /api/roles/:name | Admin/Manager | Get role by name |

### Permissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/permissions/seed | Admin | Seed default permissions |
| GET | /api/permissions | Admin/Manager | List all permissions |
| GET | /api/permissions/:id | Admin/Manager | Get permission by ID |
| POST | /api/permissions | Admin | Create permission |
| PUT | /api/permissions/:id | Admin | Update permission |
| DELETE | /api/permissions/:id | Admin | Delete permission |

### Audit Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/audit | Admin/Manager | List all logs (paginated) |
| GET | /api/audit?page=1&limit=20 | Admin/Manager | With pagination |
| GET | /api/audit?action=LOGIN&from=&to= | Admin/Manager | Filter by action/date |
| GET | /api/audit/user/:userId | Admin/Manager | Logs for specific user |
| GET | /api/audit/resource/:resource/:id | Admin/Manager | Logs for resource |

⚠️ **Append-only**: No DELETE endpoint for audit logs

### Customer Portal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/customer-portal/tickets | CUSTOMER only | Get customer's tickets |
| GET | /api/customer-portal/orders | CUSTOMER only | Get customer's orders |

⚠️ **Role-restricted**: ADMIN/MANAGER will receive 403 Forbidden

## Request Headers

```bash
Authorization: Bearer <access_token>
Content-Type: application/json
```

For cookie-based requests (refresh):
```bash
Cookie: refreshToken=<refresh_token>
```

## Response Format

### Success

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "isActive": true,
    "grantedPermissions": []
  }
}
```

### Pagination

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error

```json
{
  "statusCode": 403,
  "message": "You do not have permission to grant this permission",
  "error": "Forbidden"
}
```

## Database Schema

### User
```sql
id          UUID PRIMARY KEY
email       UNIQUE
password    VARCHAR
firstName   VARCHAR
lastName    VARCHAR
role        ENUM('ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER')
isActive    BOOLEAN DEFAULT true
grantedPermissions JSONB DEFAULT '[]'
permissions Permission[] (relation)
auditLogs   AuditLog[] (relation)
```

### Permission
```sql
id          UUID PRIMARY KEY
name        UNIQUE
description VARCHAR
resource    VARCHAR
action      VARCHAR
level       INT DEFAULT 0
```

### AuditLog
```sql
id         UUID PRIMARY KEY
userId     UUID (FK to User)
action     ENUM
resource   VARCHAR
resourceId VARCHAR
oldData    JSONB
newData    JSONB
ipAddress  VARCHAR
userAgent  VARCHAR
status     VARCHAR
timestamp  DATETIME DEFAULT NOW()
```

## Security Implementation

### Session Blacklist
- Logout adds refresh token to in-memory Set
- Refresh with blacklisted token returns 401
- Tokens cleared on server restart (acceptable for demo)

### Brute-force Protection
- In-memory Map tracks failed attempts per IP
- 5 failed attempts → 15 minute block
- Block returns 403 Forbidden

### Grant Ceiling
- Before granting permission, check granter's permissions
- If granter doesn't have permission → 403 Forbidden
- Applied to both grant and revoke operations

## Postman Collection

Import `RBAC API.postman_collection.json` for API testing.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Access token secret | - |
| JWT_EXPIRES_IN | Token expiry | 15m |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| PORT | Server port | 3000 |
| CORS_ORIGIN | Allowed frontend URL | http://localhost:3000 |

## License

MIT