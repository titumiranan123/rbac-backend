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
const ROLE_PERMISSIONS = {
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
    { name: client_1.RoleEnum.ADMIN, description: 'Full system access', level: 0 },
    { name: client_1.RoleEnum.MANAGER, description: 'Manage users and view reports', level: 1 },
    { name: client_1.RoleEnum.AGENT, description: 'Handle leads and tasks', level: 2 },
    { name: client_1.RoleEnum.CUSTOMER, description: 'Basic access', level: 3 },
];
const USERS = [
    { email: 'admin@system.com', password: 'Admin@123', firstName: 'System', lastName: 'Administrator', role: client_1.RoleEnum.ADMIN, isActive: true },
    { email: 'john.manager@company.com', password: 'Manager@123', firstName: 'John', lastName: 'Smith', role: client_1.RoleEnum.MANAGER, isActive: true },
    { email: 'sarah.manager@company.com', password: 'Manager@123', firstName: 'Sarah', lastName: 'Johnson', role: client_1.RoleEnum.MANAGER, isActive: true },
    { email: 'mike.agent@company.com', password: 'Agent@123', firstName: 'Mike', lastName: 'Williams', role: client_1.RoleEnum.AGENT, isActive: true },
    { email: 'emily.agent@company.com', password: 'Agent@123', firstName: 'Emily', lastName: 'Brown', role: client_1.RoleEnum.AGENT, isActive: true },
    { email: 'david.agent@company.com', password: 'Agent@123', firstName: 'David', lastName: 'Davis', role: client_1.RoleEnum.AGENT, isActive: false },
    { email: 'alice.customer@client.com', password: 'Customer@123', firstName: 'Alice', lastName: 'Miller', role: client_1.RoleEnum.CUSTOMER, isActive: true },
    { email: 'bob.customer@client.com', password: 'Customer@123', firstName: 'Bob', lastName: 'Wilson', role: client_1.RoleEnum.CUSTOMER, isActive: true },
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
                    where: { role_permissionId: { role: role, permissionId: permission.id } },
                    update: {},
                    create: { role: role, permissionId: permission.id },
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
//# sourceMappingURL=seed.js.map