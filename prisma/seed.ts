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
  // User permissions
  {
    name: 'users.read',
    description: 'View users',
    resource: 'users',
    action: 'read',
    level: 0,
  },
  {
    name: 'users.create',
    description: 'Create users',
    resource: 'users',
    action: 'create',
    level: 1,
  },
  {
    name: 'users.update',
    description: 'Update users',
    resource: 'users',
    action: 'update',
    level: 1,
  },
  {
    name: 'users.delete',
    description: 'Delete users',
    resource: 'users',
    action: 'delete',
    level: 0,
  },
  {
    name: 'users.grant',
    description: 'Grant permissions to users',
    resource: 'users',
    action: 'grant',
    level: 0,
  },

  // Role permissions
  {
    name: 'roles.read',
    description: 'View roles',
    resource: 'roles',
    action: 'read',
    level: 0,
  },
  {
    name: 'roles.create',
    description: 'Create roles',
    resource: 'roles',
    action: 'create',
    level: 0,
  },
  {
    name: 'roles.update',
    description: 'Update roles',
    resource: 'roles',
    action: 'update',
    level: 0,
  },
  {
    name: 'roles.delete',
    description: 'Delete roles',
    resource: 'roles',
    action: 'delete',
    level: 0,
  },

  // Permission permissions
  {
    name: 'permissions.read',
    description: 'View permissions',
    resource: 'permissions',
    action: 'read',
    level: 0,
  },
  {
    name: 'permissions.update',
    description: 'Update permissions',
    resource: 'permissions',
    action: 'update',
    level: 0,
  },

  // Audit permissions
  {
    name: 'audit.read',
    description: 'View audit logs',
    resource: 'audit',
    action: 'read',
    level: 0,
  },
  {
    name: 'audit.export',
    description: 'Export audit logs',
    resource: 'audit',
    action: 'export',
    level: 0,
  },

  // Lead permissions
  {
    name: 'leads.read',
    description: 'View leads',
    resource: 'leads',
    action: 'read',
    level: 2,
  },
  {
    name: 'leads.create',
    description: 'Create leads',
    resource: 'leads',
    action: 'create',
    level: 2,
  },
  {
    name: 'leads.update',
    description: 'Update leads',
    resource: 'leads',
    action: 'update',
    level: 2,
  },
  {
    name: 'leads.delete',
    description: 'Delete leads',
    resource: 'leads',
    action: 'delete',
    level: 1,
  },
  {
    name: 'leads.assign',
    description: 'Assign leads',
    resource: 'leads',
    action: 'assign',
    level: 1,
  },

  // Task permissions
  {
    name: 'tasks.read',
    description: 'View tasks',
    resource: 'tasks',
    action: 'read',
    level: 2,
  },
  {
    name: 'tasks.create',
    description: 'Create tasks',
    resource: 'tasks',
    action: 'create',
    level: 2,
  },
  {
    name: 'tasks.update',
    description: 'Update tasks',
    resource: 'tasks',
    action: 'update',
    level: 2,
  },
  {
    name: 'tasks.delete',
    description: 'Delete tasks',
    resource: 'tasks',
    action: 'delete',
    level: 1,
  },
  {
    name: 'tasks.assign',
    description: 'Assign tasks',
    resource: 'tasks',
    action: 'assign',
    level: 1,
  },

  // Report permissions
  {
    name: 'reports.read',
    description: 'View reports',
    resource: 'reports',
    action: 'read',
    level: 1,
  },
  {
    name: 'reports.create',
    description: 'Create reports',
    resource: 'reports',
    action: 'create',
    level: 1,
  },
  {
    name: 'reports.export',
    description: 'Export reports',
    resource: 'reports',
    action: 'export',
    level: 1,
  },

  // Settings permissions
  {
    name: 'settings.read',
    description: 'View settings',
    resource: 'settings',
    action: 'read',
    level: 0,
  },
  {
    name: 'settings.update',
    description: 'Update settings',
    resource: 'settings',
    action: 'update',
    level: 0,
  },

  // Profile permissions
  {
    name: 'profile.read',
    description: 'View own profile',
    resource: 'profile',
    action: 'read',
    level: 3,
  },
  {
    name: 'profile.update',
    description: 'Update own profile',
    resource: 'profile',
    action: 'update',
    level: 3,
  },
];

const ROLES = [
  {
    name: RoleEnum.ADMIN,
    description: 'Full system access with all permissions',
    level: 0,
  },
  {
    name: RoleEnum.MANAGER,
    description: 'Manage users, leads, tasks and view reports',
    level: 1,
  },
  {
    name: RoleEnum.AGENT,
    description: 'Handle leads and tasks assigned to them',
    level: 2,
  },
  {
    name: RoleEnum.CUSTOMER,
    description: 'Basic access to own profile and assigned tasks',
    level: 3,
  },
];

const USERS = [
  // Admin user
  {
    email: 'admin@system.com',
    password: 'Admin@123',
    firstName: 'System',
    lastName: 'Administrator',
    role: RoleEnum.ADMIN,
    isActive: true,
  },
  // Manager users
  {
    email: 'john.manager@company.com',
    password: 'Manager@123',
    firstName: 'John',
    lastName: 'Smith',
    role: RoleEnum.MANAGER,
    isActive: true,
  },
  {
    email: 'sarah.manager@company.com',
    password: 'Manager@123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: RoleEnum.MANAGER,
    isActive: true,
  },
  // Agent users
  {
    email: 'mike.agent@company.com',
    password: 'Agent@123',
    firstName: 'Mike',
    lastName: 'Williams',
    role: RoleEnum.AGENT,
    isActive: true,
  },
  {
    email: 'emily.agent@company.com',
    password: 'Agent@123',
    firstName: 'Emily',
    lastName: 'Brown',
    role: RoleEnum.AGENT,
    isActive: true,
  },
  {
    email: 'david.agent@company.com',
    password: 'Agent@123',
    firstName: 'David',
    lastName: 'Davis',
    role: RoleEnum.AGENT,
    isActive: false,
  },
  // Customer users
  {
    email: 'alice.customer@client.com',
    password: 'Customer@123',
    firstName: 'Alice',
    lastName: 'Miller',
    role: RoleEnum.CUSTOMER,
    isActive: true,
  },
  {
    email: 'bob.customer@client.com',
    password: 'Customer@123',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: RoleEnum.CUSTOMER,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('📝 Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
  }
  console.log(`✓ Created ${PERMISSIONS.length} permissions`);

  console.log('👥 Creating roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }
  console.log(`✓ Created ${ROLES.length} roles`);

  console.log('👤 Creating users...');

  for (const user of USERS) {
    const hashedPwd = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
      create: {
        email: user.email,
        password: hashedPwd,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }
  console.log(`✓ Created ${USERS.length} users`);

  console.log('🔗 Assigning permissions to roles...');

  await prisma.role.update({
    where: { name: RoleEnum.ADMIN },
    data: { permissions: PERMISSIONS.map((p) => p.name) },
  });

  const managerPermissions = PERMISSIONS.filter(
    (p) =>
      p.level >= 1 && p.name !== 'users.delete' && p.name !== 'roles.delete',
  ).map((p) => p.name);
  await prisma.role.update({
    where: { name: RoleEnum.MANAGER },
    data: { permissions: managerPermissions },
  });

  const agentPermissions = PERMISSIONS.filter(
    (p) =>
      p.level >= 2 &&
      [
        'leads.read',
        'leads.create',
        'leads.update',
        'tasks.read',
        'tasks.create',
        'tasks.update',
        'profile.read',
        'profile.update',
      ].includes(p.name),
  ).map((p) => p.name);
  await prisma.role.update({
    where: { name: RoleEnum.AGENT },
    data: { permissions: agentPermissions },
  });

  const customerPermissions = PERMISSIONS.filter(
    (p) => p.level >= 3 && ['profile.read', 'profile.update'].includes(p.name),
  ).map((p) => p.name);
  await prisma.role.update({
    where: { name: RoleEnum.CUSTOMER },
    data: { permissions: customerPermissions },
  });

  console.log('✓ Assigned permissions to all roles');

  console.log('🔐 Creating audit log entries...');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@system.com' },
  });
  if (adminUser) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'LOGIN',
          resource: 'auth',
          status: 'success',
          ipAddress: '192.168.1.1',
        },
        {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'CREATE',
          resource: 'users',
          status: 'success',
          ipAddress: '192.168.1.1',
        },
        {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'CREATE',
          resource: 'roles',
          status: 'success',
          ipAddress: '192.168.1.1',
        },
        {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'PERMISSION_CHANGE',
          resource: 'roles',
          status: 'success',
          ipAddress: '192.168.1.1',
        },
        {
          userId: adminUser.id,
          userEmail: adminUser.email,
          action: 'READ',
          resource: 'audit',
          status: 'success',
          ipAddress: '192.168.1.1',
        },
      ],
    });
  }
  console.log('✓ Created audit log entries');

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${PERMISSIONS.length} permissions`);
  console.log(`   - ${ROLES.length} roles`);
  console.log(`   - ${USERS.length} users`);
  console.log('\n🔑 Default Credentials:');
  console.log('   Admin:   admin@system.com / Admin@123');
  console.log('   Manager: john.manager@company.com / Manager@123');
  console.log('   Agent:   mike.agent@company.com / Agent@123');
  console.log('   Customer: alice.customer@client.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
