const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../../server/scripts/regions_20251224_142640.json');
const targetFile = path.join(__dirname, 'seed-regions.sql');

console.log('Reading source file...');
const rawData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const allItems = rawData.data || [];
console.log(`Total records: ${allItems.length}`);

console.log('Generating SQL...');

let sql = `-- OneRecycle 行政区划种子数据\n`;
sql += `-- Generated from regions_20251224_142640.json\n`;
sql += `-- Total records: ${allItems.length}\n\n`;
sql += `BEGIN;\n\n`;
sql += `-- 清空现有数据（可选，取消注释以启用）\n`;
sql += `-- DELETE FROM "regions";\n\n`;
sql += `-- 批量插入行政区划数据\n`;
sql += `COPY "regions" (code, name, level, parent_code, pinyin, abbr) FROM STDIN WITH (FORMAT csv, DELIMITER '|', NULL 'NULL');\n`;

// 转换数据为 CSV 格式（每行: code|name|level|parent_code|pinyin|abbr）
allItems.forEach(item => {
    const code = item.code || '';
    const name = (item.name || '').replace(/"/g, '""');
    const level = item.level || 0;
    const parentCode = item.parent_code || '\\N';
    const pinyin = (item.pinyin || '').replace(/"/g, '""') || '\\N';
    const abbr = (item.abbr || '').replace(/"/g, '""') || '\\N';

    sql += `${code}|${name}|${level}|${parentCode}|${pinyin}|${abbr}\n`;
});

sql += `\\.\n\n`;
sql += `COMMIT;\n\n`;
sql += `-- 验证\n`;
sql += `SELECT 'regions count: ' || COUNT(*) FROM "regions";\n`;
sql += `SELECT 'Level 1 (省): ' || COUNT(*) FROM "regions" WHERE level = 1;\n`;
sql += `SELECT 'Level 2 (市): ' || COUNT(*) FROM "regions" WHERE level = 2;\n`;
sql += `SELECT 'Level 3 (区): ' || COUNT(*) FROM "regions" WHERE level = 3;\n`;
sql += `SELECT 'Level 4 (街道): ' || COUNT(*) FROM "regions" WHERE level = 4;\n`;

fs.writeFileSync(targetFile, sql);
console.log(`SQL file generated: ${targetFile}`);
console.log(`File size: ${(fs.statSync(targetFile).size / 1024 / 1024).toFixed(2)} MB`);
