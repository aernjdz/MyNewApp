const fs = require('fs');
const path = require('path');

const migrationsDir = path.resolve(__dirname, '../drizzle/migrations');
const outputFile = path.join(migrationsDir, 'migrations.js');

async function convert() {
  const files = await fs.promises.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql'));

  let imports = 'const journal = require("./meta/_journal.json");\n';
  let exports = '\nmodule.exports = {\n  journal,\n  migrations: {\n';

  for (const file of sqlFiles) {
    const varName = path.basename(file, '.sql').replace(/[^a-zA-Z0-9_$]/g, '_');
    const filePath = path.join(migrationsDir, file);

    const sql = await fs.promises.readFile(filePath, 'utf8');
    const escapedSQL = sql.replace(/`/g, '\\`'); // Escape backticks for JS template strings
    const jsFile = path.join(migrationsDir, `${varName}.js`);

    await fs.promises.writeFile(jsFile, `module.exports = \`\n${escapedSQL.trim()}\n\`;\n`, 'utf8');

    imports += `const ${varName} = require('./${varName}.js');\n`;
    exports += `    ${varName},\n`;
  }

  exports += '  }\n};\n';

  await fs.promises.writeFile(outputFile, `${imports}\n${exports}`, 'utf8');
  console.log('✅ Конвертація завершена. migrations.js створено.');
}

convert().catch(err => {
  console.error('❌ Помилка при конвертації:', err);
});
