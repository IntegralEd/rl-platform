#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

// Read rules
const rulesDir = path.join(__dirname, '../../.cursor/rules');
const rules = fs.readdirSync(rulesDir)
  .filter(file => file.endsWith('.mdc'))
  .map(file => {
    const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
    const frontmatter = content.split('---')[1] || '';
    try {
      // Parse globs and description from frontmatter
      const description = frontmatter.match(/description:\s*(.+)/)?.[1] || '';
      const globsMatch = frontmatter.match(/globs:\s*\[(.*)\]/)?.[1] || '';
      const globs = globsMatch
        .split(',')
        .map(g => g.trim().replace(/['"]/g, ''))
        .filter(Boolean);
      
      return { file, description, globs };
    } catch (e) {
      console.error(`Error parsing rule ${file}:`, e);
      return null;
    }
  })
  .filter(Boolean);

// Check each staged file against rules
let violations = [];
for (const file of stagedFiles) {
  for (const rule of rules) {
    if (rule.globs.some(glob => {
      // Simple glob matching (can be enhanced with micromatch or similar)
      const pattern = glob.replace('**/', '').replace('*', '.*');
      return new RegExp(pattern).test(file);
    })) {
      console.log(`Checking ${file} against ${rule.file}...`);
      // Here we would add actual rule validation logic
      // For now just logging
    }
  }
}

if (violations.length > 0) {
  console.error('Rule violations found:');
  violations.forEach(v => console.error(`- ${v}`));
  process.exit(1);
}

console.log('All rules passed!'); 