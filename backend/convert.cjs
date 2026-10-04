const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'emobility_dump.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');

// Regex to find COPY blocks
const copyRegex = /COPY\s+([a-zA-Z0-9_.]+)\s+\(([^)]+)\)\s+FROM\s+stdin;\r?\n([\s\S]*?)\r?\n\\\./g;

sql = sql.replace(copyRegex, (match, table, columns, data) => {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const inserts = lines.map(line => {
        const values = line.split('\t').map(val => {
            val = val.trim();
            if (val === '\\N') return 'NULL';
            if (!isNaN(val) && val !== '') return val;
            if (val === 'true' || val === 'false') return val;
            return `'${val.replace(/'/g, "''")}'`;
        });
        return `INSERT INTO ${table} (${columns}) VALUES (${values.join(', ')});`;
    });
    return inserts.join('\n');
});

fs.writeFileSync(sqlPath, sql, 'utf8');
console.log('Successfully converted COPY to INSERT statements!');
