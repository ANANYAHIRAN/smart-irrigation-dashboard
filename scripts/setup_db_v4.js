import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port 6543 is for transaction pooling and often bypasses some firewall issues
const client = new pg.Client({
    host: 'db.axkvpbbaasuywhxkbofm.supabase.co',
    port: 6543,
    user: 'postgres',
    password: 'ANANYAHIRAN',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase (Port 6543)...');
        await client.connect();
        console.log('Connected!');

        const schemaPath = path.join(__dirname, '../supabase_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await client.query(sql);
        console.log('SUCCESS! Tables created.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
