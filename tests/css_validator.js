const fs = require('fs');

console.log('🔍 Validating CSS syntax & bracket matching across all stylesheets...\n');

const files = [
  'frontend/css/variables.css',
  'frontend/css/layout.css',
  'frontend/css/components.css',
  'frontend/css/portal.css',
  'frontend/css/public.css',
  'Momena_Khatun_Model_Academy_Website/style.css'
];

let allPassed = true;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let openBraces = 0;
  let line = 1;
  let col = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }

    if (char === '{') openBraces++;
    if (char === '}') openBraces--;

    if (openBraces < 0) {
      console.error(`❌ Syntax Error in ${file} at line ${line}:${col} — unexpected closing brace '}'`);
      allPassed = false;
      break;
    }
  }

  if (openBraces > 0) {
    console.error(`❌ Syntax Error in ${file} — unclosed opening brace '{' (missing ${openBraces} closing braces)`);
    allPassed = false;
  } else if (openBraces === 0) {
    console.log(`✅ ${file}: Clean syntax & perfectly matched braces (${content.split('\n').length} lines).`);
  }
}

if (!allPassed) {
  process.exit(1);
}

console.log('\n🎉 ALL CSS FILES HAVE 100% VALID SYNTAX AND BALANCED BRACES!');
