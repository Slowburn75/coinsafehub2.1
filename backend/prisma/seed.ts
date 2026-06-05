import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Permissions ────────────────────────────────────────────────────
  const permissionDefs = [
    { codename: 'users.read', name: 'View users' },
    { codename: 'users.write', name: 'Create/edit users' },
    { codename: 'users.delete', name: 'Delete users' },
    { codename: 'users.freeze', name: 'Freeze/activate users' },
    { codename: 'balances.read', name: 'View user balances' },
    { codename: 'balances.write', name: 'Modify user balances' },
    { codename: 'transactions.read', name: 'View transactions' },
    { codename: 'transactions.approve', name: 'Approve/decline transactions' },
    { codename: 'settings.read', name: 'View system settings' },
    { codename: 'settings.write', name: 'Modify system settings' },
    { codename: 'kyc.read', name: 'View KYC submissions' },
    { codename: 'kyc.verify', name: 'Approve/reject KYC' },
    { codename: 'tickets.read', name: 'View support tickets' },
    { codename: 'tickets.manage', name: 'Manage support tickets' },
    { codename: 'audit.read', name: 'View audit logs' },
    { codename: 'roles.manage', name: 'Manage roles and permissions' },
  ];

  const permissions: Record<string, string> = {};
  for (const p of permissionDefs) {
    const perm = await prisma.permission.upsert({
      where: { codename: p.codename },
      update: {},
      create: p,
    });
    permissions[p.codename] = perm.id;
  }

  // ── Roles ──────────────────────────────────────────────────────────
  const roleDefs = [
    {
      name: 'super_admin',
      description: 'Full system access, role management',
      isSystem: true,
      perms: Object.values(permissions),
    },
    {
      name: 'admin',
      description: 'Manage users, transactions, settings',
      isSystem: true,
      perms: [
        permissions['users.read'],
        permissions['users.write'],
        permissions['users.delete'],
        permissions['users.freeze'],
        permissions['balances.read'],
        permissions['balances.write'],
        permissions['transactions.read'],
        permissions['transactions.approve'],
        permissions['settings.read'],
        permissions['settings.write'],
        permissions['kyc.read'],
        permissions['tickets.read'],
        permissions['tickets.manage'],
        permissions['audit.read'],
      ],
    },
    {
      name: 'support_agent',
      description: 'View users, manage tickets',
      isSystem: true,
      perms: [
        permissions['users.read'],
        permissions['transactions.read'],
        permissions['tickets.read'],
        permissions['tickets.manage'],
      ],
    },
    {
      name: 'compliance_officer',
      description: 'Review KYC, monitor transactions',
      isSystem: true,
      perms: [
        permissions['users.read'],
        permissions['transactions.read'],
        permissions['kyc.read'],
        permissions['kyc.verify'],
        permissions['audit.read'],
      ],
    },
    {
      name: 'auditor',
      description: 'Read-only access to all data',
      isSystem: true,
      perms: [
        permissions['users.read'],
        permissions['balances.read'],
        permissions['transactions.read'],
        permissions['settings.read'],
        permissions['kyc.read'],
        permissions['tickets.read'],
        permissions['audit.read'],
      ],
    },
    {
      name: 'finance_manager',
      description: 'Approve large transactions, manage deposits',
      isSystem: true,
      perms: [
        permissions['users.read'],
        permissions['balances.read'],
        permissions['balances.write'],
        permissions['transactions.read'],
        permissions['transactions.approve'],
        permissions['settings.read'],
        permissions['audit.read'],
      ],
    },
  ];

  const roles: Record<string, string> = {};
  for (const r of roleDefs) {
    const { perms, ...roleData } = r;
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: roleData,
    });
    roles[r.name] = role.id;

    for (const permId of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
  }

  // ── Admin User ─────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@coinsafehub.com' },
    update: {},
    create: {
      email: 'admin@coinsafehub.com',
      passwordHash: adminHash,
      firstName: 'Master',
      lastName: 'Admin',
      isStaff: true,
      isSuperuser: true,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roles['super_admin'] } },
    update: {},
    create: { userId: admin.id, roleId: roles['super_admin'] },
  });

  // ── Test User ──────────────────────────────────────────────────────
  const userHash = await bcrypt.hash('User1234!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@coinsafehub.com' },
    update: {},
    create: {
      email: 'user@coinsafehub.com',
      passwordHash: userHash,
      firstName: 'John',
      lastName: 'Doe',
      country: 'United States',
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, balance: 50000, totalDeposit: 50000 },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.referralCode.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, code: 'JOHNDOE1' },
  });

  // ── Reference Data ─────────────────────────────────────────────────

  await prisma.investmentPlan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Standard Protocol',
      slug: 'starter',
      minAmount: 10000,
      maxAmount: 100000,
      profitRate: 1.0,
      durationDays: 30,
    },
  });

  await prisma.investmentPlan.upsert({
    where: { slug: 'gold' },
    update: {},
    create: {
      name: 'Premium Forensic',
      slug: 'gold',
      minAmount: 20000,
      maxAmount: 500000,
      profitRate: 30.0,
      durationDays: 30,
    },
  });

  const withdrawalMethods = [
    { name: 'Bitcoin', minAmount: 1000, maxAmount: 100000, feePercentage: 20, duration: 'Instant' },
    { name: 'Ethereum', minAmount: 1000, maxAmount: 500000, feePercentage: 20, duration: 'Instant' },
    { name: 'USDT (TRC20)', minAmount: 1000, maxAmount: 500000, feePercentage: 20, duration: 'Instant' },
    { name: 'Bank Transfer', minAmount: 1000, maxAmount: 500000, feePercentage: 20, duration: '1-3 Business Days' },
  ];

  for (const wm of withdrawalMethods) {
    await prisma.withdrawalMethod.upsert({
      where: { id: '' }, // Skip upsert — just delete old and re-create
      update: {},
      create: wm,
    }).catch(() => {
      // If upsert fails (no unique field to match on), just create
      return prisma.withdrawalMethod.create({ data: wm }).catch(() => {});
    });
  }

  // Clean up: delete all withdrawal methods and re-insert to prevent duplicates
  await prisma.withdrawalMethod.deleteMany();
  for (const wm of withdrawalMethods) {
    await prisma.withdrawalMethod.create({ data: wm });
  }

  // System configs
  const configs = [
    { key: 'admin_email', value: 'admin@coinsafehub.com' },
    { key: 'transaction_limit', value: '10000' },
    { key: 'system_status', value: 'Active' },
  ];

  for (const cfg of configs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: cfg,
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Admin: admin@coinsafehub.com / Admin123!');
  console.log('   User:  user@coinsafehub.com  / User1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
