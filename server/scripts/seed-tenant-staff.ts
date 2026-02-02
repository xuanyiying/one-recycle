import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
    console.log('开始初始化种子数据...');

    // 1. 创建测试租户
    const tenant1 = await prisma.tenant.upsert({
        where: { code: 'test_tenant' },
        update: {},
        create: {
            name: '测试租户',
            code: 'test_tenant',
            contactName: '管理员',
            contactPhone: '13812345678',
            status: 'ACTIVE',
        },
    });
    console.log(`租户已创建: ${tenant1.name} (${tenant1.id})`);

    // 2. 创建系统角色 (Admin)
    const adminRole = await prisma.role.upsert({
        where: { code: 'ADMIN' },
        update: {},
        create: {
            name: '超级管理员',
            code: 'ADMIN',
            isAdmin: true,
            description: '拥有所有权限的系统管理员',
        },
    });

    const managerRole = await prisma.role.upsert({
        where: { code: 'MANAGER' },
        update: {},
        create: {
            name: '部门经理',
            code: 'MANAGER',
            tenantId: tenant1.id,
            description: '负责部门管理',
        },
    });
    console.log('角色已创建: ADMIN, MANAGER');

    // 3. 创建测试员工
    const staff1 = await prisma.staff.upsert({
        where: { username: 'admin' },
        update: {
            password: hashPassword('123456'),
            tenantId: tenant1.id,
            roleId: adminRole.id,
        },
        create: {
            username: 'admin',
            password: hashPassword('123456'),
            realName: '系统管理员',
            tenantId: tenant1.id,
            roleId: adminRole.id,
            status: 'ACTIVE',
        },
    });
    console.log(`员工已创建: ${staff1.username}`);

    console.log('种子数据初始化完成！');
    console.log('登录信息:');
    console.log(`- 租户代码: ${tenant1.code}`);
    console.log(`- 用户名: ${staff1.username}`);
    console.log(`- 密码: 123456`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
