# RBAC Backend

Role-Based Access Control System with NestJS + Prisma + Zod

## Tech Stack

- **Framework:** NestJS
- **ORM:** Prisma
- **Validation:** Zod
- **Database:** PostgreSQL
- **Authentication:** JWT (No Passport)

## Features

- 4 Roles: Admin, Manager, Agent, Customer
- Dynamic Permission System with Grant Ceiling
- JWT Authentication (Access + Refresh tokens)
- Full Audit Log (Append-only)
- REST API

## Role Hierarchy

```
Admin (0) > Manager (1) > Agent (2) > Customer (3)
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

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Create default admin user
npm run db:seed
```

### 4. Run Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Default Admin

- **Email:** admin@system.com
- **Password:** Admin@123

## API Endpoints

### Authentication

```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login user
POST /api/auth/refresh     - Refresh access token
POST /api/auth/logout      - Logout user
POST /api/auth/me          - Get current user
```

### Users

```
GET    /api/users              - List all users (paginated)
GET    /api/users/:id          - Get user by ID
POST   /api/users              - Create user (Admin only)
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user (Admin only)
POST   /api/users/:id/role     - Assign role to user
POST   /api/users/:id/permissions/:permission - Grant permission
DELETE /api/users/:id/permissions/:permission  - Revoke permission
```

### Roles

```
GET /api/roles           - List all roles
GET /api/roles/:name     - Get role details
```

### Permissions

```
GET    /api/permissions              - List all permissions
GET    /api/permissions/:id          - Get permission by ID
POST   /api/permissions              - Create permission (Admin only)
PUT    /api/permissions/:id          - Update permission (Admin only)
DELETE /api/permissions/:id          - Delete permission (Admin only)
POST   /api/permissions/seed         - Seed default permissions
```

### Audit Logs

```
GET /api/audit                              - List all logs (paginated)
GET /api/audit?page=1&limit=20              - With pagination
GET /api/audit?action=LOGIN&from=&to=       - Filter by action/date
GET /api/audit/user/:userId                 - Logs for specific user
GET /api/audit/resource/:resource/:id      - Logs for resource
```

## Request Headers

```bash
Authorization: Bearer <access_token>
```

## Response Format

### Success

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "role": "ADMIN"
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

## Database Schema

### User

- id, email, password, firstName, lastName
- role (ADMIN, MANAGER, AGENT, CUSTOMER)
- isActive, lastLoginAt
- grantedPermissions, permissions

### Permission

- id, name, description, resource, action, level

### AuditLog

- id, userId, userEmail, action
- resource, resourceId, oldData, newData
- ipAddress, userAgent, status, timestamp

## License

MIT"# rbac-frontend" 
