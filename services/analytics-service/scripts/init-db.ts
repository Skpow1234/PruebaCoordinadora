import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'logistics_db'
  });

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, '../src/infrastructure/database/init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await pool.execute(statement);
    }

    console.log('Analytics service database initialized successfully');
  } catch (error) {
    console.error('Error initializing analytics service database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch(console.error); 