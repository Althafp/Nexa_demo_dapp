#!/usr/bin/env node

/**
 * Fix Import Assertions Script (Cross-Platform)
 * This script automatically fixes deprecated 'assert' syntax to 'with' syntax
 * in @bitauth/libauth package for Node.js 22+ compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing import assertions in @bitauth/libauth...');

// Find all JavaScript files in the libauth package
const libauthPath = path.join('node_modules', '@bitauth', 'libauth');

if (!fs.existsSync(libauthPath)) {
  console.log('❌ @bitauth/libauth package not found. Make sure you\'ve run \'yarn install\' first.');
  process.exit(1);
}

function findJsFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(findJsFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const files = findJsFiles(libauthPath);
let fixedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace assert with with syntax
    const newContent = content.replace(/assert \{ type: 'json' \}/g, 'with { type: \'json\' }');
    
    // Count replacements
    const replacements = (originalContent.match(/assert \{ type: 'json' \}/g) || []).length;
    
    if (replacements > 0) {
      fs.writeFileSync(file, newContent);
      fixedFiles++;
      totalReplacements += replacements;
      console.log(`✅ Fixed ${replacements} assertion(s) in: ${path.basename(file)}`);
    }
  } catch (error) {
    console.log(`⚠️ Error processing ${file}: ${error.message}`);
  }
}

if (fixedFiles > 0) {
  console.log(`🎉 Successfully fixed ${totalReplacements} import assertion(s) in ${fixedFiles} file(s)`);
  console.log('💡 Note: This fix will be lost when you run \'yarn install\' again.');
  console.log('📝 Consider reporting this issue to @bitauth/libauth maintainers.');
} else {
  console.log('ℹ️ No import assertions found to fix.');
}

console.log('\n🚀 You can now run \'npm run dev\' or \'yarn dev\'');
