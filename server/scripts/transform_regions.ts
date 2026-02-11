
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const sourceFile = path.join(__dirname, 'regions_20251224_142640.json');
const targetStaticFile = path.join(__dirname, 'region.json');

interface RegionItem {
    code: string;
    name: string;
    level: number;
    parent_code?: string;
    pinyin?: string;
    abbr?: string;
}

async function main() {
    const connectionString = process.env.DATABASE_URL;
    let prisma: PrismaClient | null = null;
    let pool: Pool | null = null;

    if (!connectionString) {
        console.warn('⚠️ DATABASE_URL 未设置，将跳过数据库同步，仅生成静态文件');
    } else {
        // 创建 PostgreSQL 连接池和适配器 (Prisma 7 最佳实践)
        pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    }

    try {
        console.log('🚀 开始数据处理流水线...');
        
        if (!fs.existsSync(sourceFile)) {
            throw new Error(`源文件不存在: ${sourceFile}`);
        }

        const rawData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        const allItems: RegionItem[] = rawData.data || [];
        console.log(`📦 成功加载原始数据，共 ${allItems.length} 条记录`);

        // --- 1. 静态数据处理 (Level 1 & 2) ---
        console.log('📝 正在生成轻量级静态 JSON (Level 1 & 2)...');
        const regionMap: Record<string, Record<string, { name: string; pinyin: string; abbr: string }>> = { "000000": {} };
        
        allItems.forEach(item => {
            if (item.level <= 2) {
                // 使用完整 12 位编码
                const parentCode = item.parent_code || "000000";
                
                const normalizedParent = parentCode;
                const normalizedCode = item.code;

                if (!regionMap[normalizedParent]) regionMap[normalizedParent] = {};
                
                regionMap[normalizedParent][normalizedCode] = {
                    name: item.name,
                    pinyin: item.pinyin || "",
                    abbr: item.abbr || ""
                };
            }
        });

        fs.writeFileSync(targetStaticFile, JSON.stringify(regionMap, null, 2));
        console.log('✅ 静态文件 region.json 已更新');

        // --- 2. 数据库入库处理 (All Levels) ---
        if (prisma) {
            console.log('🗄️  正在同步数据到数据库 (PostgreSQL)...');
            
            // 分批处理以防止内存溢出或数据库压力过大
            const BATCH_SIZE = 500; // 降低批次大小以提高稳定性
            let processedCount = 0;

            for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
                const batch = allItems.slice(i, i + BATCH_SIZE).map(item => ({
                    code: item.code, // 数据库保留 12 位完整码
                    name: item.name,
                    level: item.level,
                    parentCode: item.parent_code || null,
                    pinyin: item.pinyin || null,
                    abbr: item.abbr || null
                }));

                // 使用 upsert 确保数据存在则更新，不存在则插入
                await Promise.all(batch.map(data => 
                    prisma!.region.upsert({
                        where: { code: data.code },
                        update: data,
                        create: data
                    })
                ));

                processedCount += batch.length;
                process.stdout.write(`\r进度: ${processedCount}/${allItems.length} (${Math.round(processedCount/allItems.length*100)}%)`);
            }
            
            console.log('\n✅ 数据库同步完成');
        } else {
            console.log('⚠️ 跳过数据库同步');
        }

    } catch (error) {
        console.error('\n❌ 处理失败:', error);
        process.exit(1);
    } finally {
        if (prisma) await prisma.$disconnect();
        if (pool) await pool.end();
    }
}

main();
