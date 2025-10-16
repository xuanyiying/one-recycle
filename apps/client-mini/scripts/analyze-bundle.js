#!/usr/bin/env node

/**
 * Bundle Size Analyzer Script
 * Analyzes the build output and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });

  return totalSize;
}

function analyzeBundle() {
  const distPath = path.join(__dirname, '../dist');

  if (!fs.existsSync(distPath)) {
    console.log(`${colors.red}Error: dist directory not found. Please build the project first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}=== Bundle Size Analysis ===${colors.reset}\n`);

  // Analyze total size
  const totalSize = getDirectorySize(distPath);
  console.log(`${colors.magenta}Total Bundle Size:${colors.reset} ${formatBytes(totalSize)}`);

  // Size thresholds
  const warningThreshold = 2 * 1024 * 1024; // 2MB
  const errorThreshold = 4 * 1024 * 1024; // 4MB

  if (totalSize > errorThreshold) {
    console.log(`${colors.red}⚠️  Bundle size exceeds 4MB! Consider optimization.${colors.reset}`);
  } else if (totalSize > warningThreshold) {
    console.log(`${colors.yellow}⚠️  Bundle size exceeds 2MB. Optimization recommended.${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Bundle size is within acceptable range.${colors.reset}`);
  }

  console.log('\n');

  // Analyze individual chunks
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));

  if (jsFiles.length > 0) {
    console.log(`${colors.blue}=== JavaScript Chunks ===${colors.reset}\n`);
    
    const fileSizes = jsFiles.map(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size };
    });

    fileSizes.sort((a, b) => b.size - a.size);

    fileSizes.forEach(({ name, size }) => {
      const sizeStr = formatBytes(size);
      const color = size > 500 * 1024 ? colors.red : size > 200 * 1024 ? colors.yellow : colors.green;
      console.log(`${color}${name}${colors.reset}: ${sizeStr}`);
    });
  }

  console.log('\n');

  // Optimization recommendations
  console.log(`${colors.blue}=== Optimization Recommendations ===${colors.reset}\n`);

  const recommendations = [
    '1. Use code splitting for non-critical pages',
    '2. Lazy load heavy components',
    '3. Remove unused dependencies',
    '4. Enable tree shaking',
    '5. Compress images and assets',
    '6. Use dynamic imports for large libraries',
    '7. Enable gzip compression on server',
  ];

  recommendations.forEach(rec => {
    console.log(`${colors.green}✓${colors.reset} ${rec}`);
  });

  console.log('\n');
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
  process.exit(1);
}
