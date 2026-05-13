# RBAC Backend

Role-Based Access Control System with NestJS + Prisma + PostgreSQL

## Tech Stack

- **Framework:** NestJS 11
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT (15min access, 7d refresh)
- **Validation:** Zod

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

**Edit `.env` file:**

```env
# Database - Use your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5433/database?sslmode=require"

# JWT Secrets - Generate random strings
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# Token Expiry
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# OR run migrations (for production)
npm run db:migrate
```

### 4. Seed Data

```bash
# Seed permissions and default admin user
npm run seed
```

**Default Users:**

| Email | Password | Role |
|-------|----------|------|
| admin@system.com | Admin@123 | ADMIN |
| john.manager@company.com | Manager@123 | MANAGER |
| mike.agent@company.com | Agent@123 | AGENT |
| alice.customer@client.com | Customer@123 | CUSTOMER |

### 5. Run Server

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

**Server runs at:** http://localhost:4000/api

---

## Database Setup (Neon PostgreSQL)

If using Neon (cloud PostgreSQL):

1. Create project at https://neon.tech
2. Copy connection string from dashboard
3. Update `DATABASE_URL` in `.env`

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in development mode |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed default data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## Production Deployment

### Build

```bash
npm run build
```

### Run

```bash
# Set environment variables
export DATABASE_URL="your-production-db-url"
export JWT_SECRET="your-production-secret"
export JWT_REFRESH_SECRET="your-production-refresh-secret"
export NODE_ENV="production"

# Start server
node dist/src/main.js
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/src/main.js"]
```

---

## Features

### Authentication
- JWT Access Token (15 min expiry)
- Refresh Token (7 days, httpOnly cookie)
- Session Blacklist (logout invalidates tokens)
- Brute-force Protection (5 failed attempts → 15 min block)

### Role Hierarchy
```
Admin (0) > Manager (1) > Agent (2) > Customer (3)
```

| Role | Can Manage | Permissions |
|------|------------|-------------|
| Admin | All roles | Full access, can ban users |
| Manager | Agent, Customer | Can suspend/activate, grant permissions |
| Agent | Customer | Limited view access |
| Customer | - | Customer Portal only |

### Permission Atoms (21 total)
```
view_dashboard, view_users, create_user, edit_user, delete_user
suspend_user, ban_user, view_leads, create_lead, edit_lead, delete_lead
view_tasks, create_task, edit_task, delete_task, view_reports
view_audit_log, view_settings, view_customer_portal, view_orders, view_tickets
```

### Grant Ceiling
- Can't grant permissions you don't have
- Admin can grant all
- Manager can grant permissions at level ≥ 1

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/refresh | Public | Refresh token |
| POST | /api/auth/logout | Protected | Logout |
| GET | /api/auth/me | Protected | Get current user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users | Admin/Manager | List users |
| GET | /api/users/:id | Admin/Manager | Get user |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:id | Admin/Manager | Update user |
| DELETE | /api/users/:id | Admin | Delete user |
| PATCH | /api/users/:id/suspend | Admin/Manager | Suspend |
| PATCH | /api/users/:id/ban | Admin | Ban |
| PATCH | /api/users/:id/activate | Admin/Manager | Activate |
| POST | /api/users/:id/role | Admin | Assign role |
| POST | /api/users/:id/permissions/:p | Admin/Manager | Grant permission |
| DELETE | /api/users/:id/permissions/:p | Admin/Manager | Revoke permission |

### Permissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/permissions | Public | List all |
| GET | /api/permissions/grantable | Admin/Manager | Grantable perms |
| POST | /api/permissions | Admin | Create |
| PUT | /api/permissions/:id | Admin | Update |
| DELETE | /api/permissions/:id | Admin | Delete |

### Audit

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/audit | Admin/Manager | List logs |
| GET | /api/audit/user/:userId | Admin/Manager | User's logs |
| GET | /api/audit/resource/:r/:id | Admin/Manager | Resource logs |

### Customer Portal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/customer-portal/tickets | Customer | Get tickets |
| GET | /api/customer-portal/orders | Customer | Get orders |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| JWT_SECRET | Yes | - | Access token secret (min 32 chars) |
| JWT_REFRESH_SECRET | Yes | - | Refresh token secret |
| JWT_EXPIRES_IN | No | 15m | Access token expiry |
| JWT_REFRESH_EXPIRES_IN | No | 7d | Refresh token expiry |
| PORT | No | 4000 | Server port |
| NODE_ENV | No | development | Environment |
| CORS_ORIGIN | No | http://localhost:3000 | Allowed frontend URL |

---

## Testing API

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"Admin@123"}'
```

### Get Current User

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### List Users

```bash
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer <access_token>"
```

---

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- For Neon: add `?sslmode=require` at end

### Prisma Client Not Found
```bash
npm run db:generate
```

### Token Expired
- Login again to get new token
- Refresh token expires after 7 days

### Permission Denied (403)
- Check your role has required permission
- Manager can only grant level ≥ 1 permissions

---

## License

MIT