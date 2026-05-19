import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using the provided password
const password = 'Anuananya@200515';
const host = 'db.axkvpbbaasuywhxkbofm.supabase.co';
const ports = [5432, 6543];

async function testConnection(port) {
    const client = new pg.Client({
        host,
        port,
        user: 'postgres',
        password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });

    try {
        console.log(`Testing Port ${port}...`);
        await client.connect();
        console.log(`SUCCESS: Connected on Port ${port}`);

        const schemaPath = path.join(__dirname, '../supabase_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await client.query(sql);
        console.log('SCHEMA APPLIED SUCCESSFULLY!');
        await client.end();
        return true;
    } catch (err) {
        console.log(`FAILED on Port ${port}: ${err.message}`);
        try { await client.end(); } catch (e) { }
        return false;
    }
}

async function run() {
    for (const port of ports) {
        const success = await testConnection(port);
        if (success) {
            console.log('--- SETUP COMPLETE ---');
            process.exit(0);
        }
    }
    console.log('--- ALL ATTEMPTS FAILED ---');
    process.exit(1);
}

run();
