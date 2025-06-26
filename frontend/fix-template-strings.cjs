const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src'); // adjust if your frontend files are elsewhere

function fixTemplateStrings(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      fixTemplateStrings(fullPath); // recurse into subfolders
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Replace things like: 'http://${SOME_VAR}/...'  with backticks
      const fixed = content.replace(
        /'(\$\{[^}]+\}[^']*)'/g,
        (match, inner) => `\`${inner}\``
      );

      if (fixed !== content) {
        fs.writeFileSync(fullPath, fixed);
        console.log(`✅ Fixed template string in: ${fullPath}`);
      }
    }
  });
}

fixTemplateStrings(targetDir);
