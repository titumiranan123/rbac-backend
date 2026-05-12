---
id: 20260101000000_initial_migration
title: "Initial migration"
author: ""
datetime: "2026-01-01 00:00:00"
comment: "Creates initial schema with User, Role, Permission, and AuditLog models"
---

## Changes

### New Tables

- **permissions**: Stores all system permissions with resource, action, and level
- **roles**: Role definitions with ADMIN, MANAGER, AGENT, CUSTOMER
- **users**: User accounts with authentication and role assignment
- **audit_logs**: Audit trail for all system actions

### New Enums

- **RoleEnum**: ADMIN, MANAGER, AGENT, CUSTOMER
- **AuditAction**: LOGIN, LOGOUT, REGISTER, CREATE, UPDATE, DELETE, READ, PERMISSION_CHANGE, ROLE_CHANGE, ACCESS_DENIED

### Indexes

- Unique indexes on: permissions.name, roles.name, users.email
- Indexes on: audit_logs.userId, audit_logs.action, audit_logs.timestamp

### Relationships

- audit_logs.userId -> users.id (many-to-one)