import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

const sourceFile = path.join(__dirname, 'regions_20251224_142640.json');
const targetServerFile = path.join(__dirname, 'region.json');
const targetMiniFile = path.join(__dirname, '../../apps/mini-client/src/data/region.json');

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
        console.log('🚀 开始行政区域数据处理流水线...');
        
        if (!fs.existsSync(sourceFile)) {
            throw new Error(`源文件不存在: ${sourceFile}`);
        }

        const rawData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        const allItems: RegionItem[] = rawData.data || [];
        console.log(`📦 成功加载原始数据，共 ${allItems.length} 条记录`);

        // --- 1. 静态数据处理 (Level 1 & 2) ---
        console.log('📝 正在提取 Level 1 & 2 静态数据...');
        const newRegionMap: Record<string, Record<string, { name: string; pinyin: string; abbr: string }>> = { "000000": {} };
        
        allItems.forEach(item => {
            if (item.level <= 2) {
                const parentCode = item.parent_code || "000000";
                if (!newRegionMap[parentCode]) newRegionMap[parentCode] = {};
                
                newRegionMap[parentCode][item.code] = {
                    name: item.name,
                    pinyin: item.pinyin || "",
                    abbr: item.abbr || ""
                };
            }
        });

        // 合并并写入文件的辅助函数
        const saveAndMerge = (filePath: string) => {
            let finalMap = newRegionMap;
            
            if (fs.existsSync(filePath)) {
                try {
                    const existingMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`🔍 发现现有文件 ${path.basename(filePath)}，正在合并数据...`);
                    
                    // 合并 parent_code 维度的映射
                    for (const parentCode in newRegionMap) {
                        finalMap[parentCode] = {
                            ...(existingMap[parentCode] || {}),
                            ...newRegionMap[parentCode]
                        };
                    }
                    
                    // 保留现有文件中但在新数据中没有的 parent_code
                    for (const parentCode in existingMap) {
                        if (!finalMap[parentCode]) {
                            finalMap[parentCode] = existingMap[parentCode];
                        }
                    }
                } catch (e : any) {
                    console.warn(`⚠️ 合并失败 (${path.basename(filePath)}), 将直接覆盖:`, e.message);
                }
            }

            fs.writeFileSync(filePath, JSON.stringify(finalMap, null, 2));
            console.log(`✅ 文件已更新: ${filePath}`);
        };

        saveAndMerge(targetServerFile);
        
        const miniDir = path.dirname(targetMiniFile);
        if (fs.existsSync(miniDir)) {
            saveAndMerge(targetMiniFile);
        } else {
            console.warn(`⚠️ 小程序端目录不存在，跳过同步: ${miniDir}`);
        }

        // --- 2. 数据库入库处理 (All Levels) ---
        if (prisma) {
            console.log('🗄️  正在同步到数据库 (使用 upsert 自动合并)...');
            
            const BATCH_SIZE = 500;
            let processedCount = 0;

            for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
                const batch = allItems.slice(i, i + BATCH_SIZE).map(item => ({
                    code: item.code,
                    name: item.name,
                    level: item.level,
                    parentCode: item.parent_code || null,
                    pinyin: item.pinyin || null,
                    abbr: item.abbr || null
                }));

                // 并行执行 upsert
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
