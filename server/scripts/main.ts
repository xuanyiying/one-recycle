import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 开始执行全量种子数据初始化...');
  
  const scriptsDir = __dirname;
  const projectRoot = path.join(scriptsDir, '..');
  
  // 定义要执行的脚本列表（按顺序）
  const scripts = [
    'seed-tenant-staff.ts', // 基础租户和员工数据
    'seed-categories.ts',   // 分类数据
    'transform_regions.ts', // 地区数据导入
    'seed-content-config.ts', // FAQ和回收规则
  ];

  for (const script of scripts) {
    const scriptPath = path.join(scriptsDir, script);
    
    if (!fs.existsSync(scriptPath)) {
      console.warn(`⚠️ 脚本文件不存在，跳过: ${script}`);
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`▶️  正在执行: ${script}`);
    console.log(`--------------------------------------------------`);

    try {
      // 使用 ts-node 执行脚本，继承当前 stdio 以显示输出
      execSync(`npx ts-node ${scriptPath}`, {
        cwd: projectRoot, // 在 server 根目录下执行，确保 .env 读取正确
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' } // 保留颜色输出
      });
      console.log(`✅ ${script} 执行成功`);
    } catch (error) {
      console.error(`❌ ${script} 执行失败`);
      // 选择是否中断，通常种子数据失败应该中断
      process.exit(1);
    }
  }

  console.log(`\n🎉 所有种子数据初始化完成！`);
}

main().catch((error) => {
  console.error('❌ 主脚本执行出错:', error);
  process.exit(1);
});
