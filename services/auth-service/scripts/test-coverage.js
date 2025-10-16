#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running test coverage analysis...\n');

try {
  // 运行测试并生成覆盖率报告
  console.log('📊 Generating coverage report...');
  execSync('npx jest --coverage --silent', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 检查覆盖率文件是否存在
  const coverageFile = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html');
  if (fs.existsSync(coverageFile)) {
    console.log('\n✅ Coverage report generated successfully!');
    console.log(`📁 Report location: ${coverageFile}`);
  }

  // 读取覆盖率摘要
  const coverageSummaryFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  if (fs.existsSync(coverageSummaryFile)) {
    const summary = JSON.parse(fs.readFileSync(coverageSummaryFile, 'utf8'));
    const total = summary.total;
    
    console.log('\n📈 Coverage Summary:');
    console.log(`   Lines: ${total.lines.pct}%`);
    console.log(`   Functions: ${total.functions.pct}%`);
    console.log(`   Branches: ${total.branches.pct}%`);
    console.log(`   Statements: ${total.statements.pct}%`);
  }

} catch (error) {
  console.error('❌ Error running tests:', error.message);
  process.exit(1);
}