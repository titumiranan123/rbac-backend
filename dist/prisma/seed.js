"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const connectionString = process.env.DATABASE_URL ||
    'postgresql://admin:admin123@localhost:5433/rbac_db?schema=public';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const PERMISSIONS = [
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
        name: client_1.RoleEnum.ADMIN,
        description: 'Full system access with all permissions',
        level: 0,
    },
    {
        name: client_1.RoleEnum.MANAGER,
        description: 'Manage users, leads, tasks and view reports',
        level: 1,
    },
    {
        name: client_1.RoleEnum.AGENT,
        description: 'Handle leads and tasks assigned to them',
        level: 2,
    },
    {
        name: client_1.RoleEnum.CUSTOMER,
        description: 'Basic access to own profile and assigned tasks',
        level: 3,
    },
];
const USERS = [
    {
        email: 'admin@system.com',
        password: 'Admin@123',
        firstName: 'System',
        lastName: 'Administrator',
        role: client_1.RoleEnum.ADMIN,
        isActive: true,
    },
    {
        email: 'john.manager@company.com',
        password: 'Manager@123',
        firstName: 'John',
        lastName: 'Smith',
        role: client_1.RoleEnum.MANAGER,
        isActive: true,
    },
    {
        email: 'sarah.manager@company.com',
        password: 'Manager@123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: client_1.RoleEnum.MANAGER,
        isActive: true,
    },
    {
        email: 'mike.agent@company.com',
        password: 'Agent@123',
        firstName: 'Mike',
        lastName: 'Williams',
        role: client_1.RoleEnum.AGENT,
        isActive: true,
    },
    {
        email: 'emily.agent@company.com',
        password: 'Agent@123',
        firstName: 'Emily',
        lastName: 'Brown',
        role: client_1.RoleEnum.AGENT,
        isActive: true,
    },
    {
        email: 'david.agent@company.com',
        password: 'Agent@123',
        firstName: 'David',
        lastName: 'Davis',
        role: client_1.RoleEnum.AGENT,
        isActive: false,
    },
    {
        email: 'alice.customer@client.com',
        password: 'Customer@123',
        firstName: 'Alice',
        lastName: 'Miller',
        role: client_1.RoleEnum.CUSTOMER,
        isActive: true,
    },
    {
        email: 'bob.customer@client.com',
        password: 'Customer@123',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: client_1.RoleEnum.CUSTOMER,
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
        where: { name: client_1.RoleEnum.ADMIN },
        data: { permissions: PERMISSIONS.map((p) => p.name) },
    });
    const managerPermissions = PERMISSIONS.filter((p) => p.level >= 1 && p.name !== 'users.delete' && p.name !== 'roles.delete').map((p) => p.name);
    await prisma.role.update({
        where: { name: client_1.RoleEnum.MANAGER },
        data: { permissions: managerPermissions },
    });
    const agentPermissions = PERMISSIONS.filter((p) => p.level >= 2 &&
        [
            'leads.read',
            'leads.create',
            'leads.update',
            'tasks.read',
            'tasks.create',
            'tasks.update',
            'profile.read',
            'profile.update',
        ].includes(p.name)).map((p) => p.name);
    await prisma.role.update({
        where: { name: client_1.RoleEnum.AGENT },
        data: { permissions: agentPermissions },
    });
    const customerPermissions = PERMISSIONS.filter((p) => p.level >= 3 && ['profile.read', 'profile.update'].includes(p.name)).map((p) => p.name);
    await prisma.role.update({
        where: { name: client_1.RoleEnum.CUSTOMER },
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
//# sourceMappingURL=seed.js.map