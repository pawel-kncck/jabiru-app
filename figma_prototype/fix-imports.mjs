import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeVersionFromImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regular expression to match imports with version numbers
  const importRegex = /from\s+["']([^"']+)@[\d.]+["']/g;

  // Replace imports with version numbers
  content = content.replace(importRegex, 'from "$1"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in: ${filePath}`);
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      removeVersionFromImports(fullPath);
    }
  });
}

// Process the components directory
processDirectory('./components');

console.log('Import fixing complete!');
