import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, RoleEnum } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://admin:admin123@localhost:5433/rbac_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { name: 'view_dashboard', description: 'View Dashboard', resource: 'dashboard', action: 'view', level: 0 },
  { name: 'view_users', description: 'View Users', resource: 'users', action: 'view', level: 0 },
  { name: 'create_user', description: 'Create Users', resource: 'users', action: 'create', level: 0 },
  { name: 'edit_user', description: 'Edit Users', resource: 'users', action: 'edit', level: 0 },
  { name: 'delete_user', description: 'Delete Users', resource: 'users', action: 'delete', level: 0 },
  { name: 'suspend_user', description: 'Suspend Users', resource: 'users', action: 'suspend', level: 0 },
  { name: 'ban_user', description: 'Ban Users', resource: 'users', action: 'ban', level: 0 },
  { name: 'view_leads', description: 'View Leads', resource: 'leads', action: 'view', level: 2 },
  { name: 'create_lead', description: 'Create Leads', resource: 'leads', action: 'create', level: 2 },
  { name: 'edit_lead', description: 'Edit Leads', resource: 'leads', action: 'edit', level: 2 },
  { name: 'delete_lead', description: 'Delete Leads', resource: 'leads', action: 'delete', level: 1 },
  { name: 'view_tasks', description: 'View Tasks', resource: 'tasks', action: 'view', level: 2 },
  { name: 'create_task', description: 'Create Tasks', resource: 'tasks', action: 'create', level: 2 },
  { name: 'edit_task', description: 'Edit Tasks', resource: 'tasks', action: 'edit', level: 2 },
  { name: 'delete_task', description: 'Delete Tasks', resource: 'tasks', action: 'delete', level: 1 },
  { name: 'view_reports', description: 'View Reports', resource: 'reports', action: 'view', level: 1 },
  { name: 'view_audit_log', description: 'View Audit Log', resource: 'audit', action: 'view', level: 0 },
  { name: 'view_settings', description: 'View Settings', resource: 'settings', action: 'view', level: 0 },
  { name: 'view_customer_portal', description: 'View Customer Portal', resource: 'customer_portal', action: 'view', level: 0 },
  { name: 'view_orders', description: 'View Orders', resource: 'orders', action: 'view', level: 3 },
  { name: 'view_tickets', description: 'View Tickets', resource: 'tickets', action: 'view', level: 3 },
];

const ROLE_PERMISSIONS: Record<RoleEnum, string[]> = {
  ADMIN: [
    'view_dashboard', 'view_users', 'create_user', 'edit_user', 'delete_user',
    'suspend_user', 'ban_user', 'view_leads', 'create_lead', 'edit_lead',
    'delete_lead', 'view_tasks', 'create_task', 'edit_task', 'delete_task',
    'view_reports', 'view_audit_log', 'view_settings', 'view_customer_portal',
    'view_orders', 'view_tickets',
  ],
  MANAGER: [
    'view_dashboard', 'view_users', 'create_user', 'edit_user', 'view_leads',
    'create_lead', 'edit_lead', 'delete_lead', 'view_tasks', 'create_task',
    'edit_task', 'delete_task', 'view_reports', 'view_audit_log', 'view_settings',
    'view_customer_portal',
  ],
  AGENT: [
    'view_dashboard', 'view_leads', 'create_lead', 'edit_lead', 'view_tasks',
    'create_task', 'edit_task', 'view_customer_portal',
  ],
  CUSTOMER: [
    'view_dashboard', 'view_customer_portal', 'view_orders', 'view_tickets',
  ],
};

const ROLES = [
  { name: RoleEnum.ADMIN, description: 'Full system access', level: 0 },
  { name: RoleEnum.MANAGER, description: 'Manage users and view reports', level: 1 },
  { name: RoleEnum.AGENT, description: 'Handle leads and tasks', level: 2 },
  { name: RoleEnum.CUSTOMER, description: 'Basic access', level: 3 },
];

const USERS = [
  { email: 'admin@system.com', password: 'Admin@123', firstName: 'System', lastName: 'Administrator', role: RoleEnum.ADMIN, isActive: true },
  { email: 'john.manager@company.com', password: 'Manager@123', firstName: 'John', lastName: 'Smith', role: RoleEnum.MANAGER, isActive: true },
  { email: 'sarah.manager@company.com', password: 'Manager@123', firstName: 'Sarah', lastName: 'Johnson', role: RoleEnum.MANAGER, isActive: true },
  { email: 'mike.agent@company.com', password: 'Agent@123', firstName: 'Mike', lastName: 'Williams', role: RoleEnum.AGENT, isActive: true },
  { email: 'emily.agent@company.com', password: 'Agent@123', firstName: 'Emily', lastName: 'Brown', role: RoleEnum.AGENT, isActive: true },
  { email: 'david.agent@company.com', password: 'Agent@123', firstName: 'David', lastName: 'Davis', role: RoleEnum.AGENT, isActive: false },
  { email: 'alice.customer@client.com', password: 'Customer@123', firstName: 'Alice', lastName: 'Miller', role: RoleEnum.CUSTOMER, isActive: true },
  { email: 'bob.customer@client.com', password: 'Customer@123', firstName: 'Bob', lastName: 'Wilson', role: RoleEnum.CUSTOMER, isActive: true },
];

async function main() {
  console.log('Starting database seed...');

  console.log('Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
  }
  console.log(`Created ${PERMISSIONS.length} permissions`);

  console.log('Creating roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }
  console.log(`Created ${ROLES.length} roles`);

  console.log('Assigning permissions to roles...');
  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permName of perms) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role: role as RoleEnum, permissionId: permission.id } },
          update: {},
          create: { role: role as RoleEnum, permissionId: permission.id },
        });
      }
    }
    console.log(`Assigned ${perms.length} permissions to ${role}`);
  }

  console.log('Creating users...');
  for (const user of USERS) {
    const hashedPwd = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive },
      create: { email: user.email, password: hashedPwd, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive },
    });
  }
  console.log(`Created ${USERS.length} users`);

  console.log('Creating audit log entries...');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@system.com' } });
  if (adminUser) {
    await prisma.auditLog.createMany({
      data: [
        { userId: adminUser.id, userEmail: adminUser.email, action: 'LOGIN', resource: 'auth', status: 'success' },
        { userId: adminUser.id, userEmail: adminUser.email, action: 'CREATE', resource: 'users', status: 'success' },
        { userId: adminUser.id, userEmail: adminUser.email, action: 'PERMISSION_CHANGE', resource: 'roles', status: 'success' },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Database seed completed!');
  console.log('\nCredentials:');
  console.log('Admin: admin@system.com / Admin@123');
  console.log('Manager: john.manager@company.com / Manager@123');
  console.log('Agent: mike.agent@company.com / Agent@123');
  console.log('Customer: alice.customer@client.com / Customer@123');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });