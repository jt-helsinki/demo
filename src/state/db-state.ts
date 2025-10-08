import SQLite from 'expo-sqlite';
import { SensorType } from '@/model/ble';

// Create (or open) the database
const dbPromise = SQLite.openDatabaseAsync('session.db');

// Initialize database (create table if not exists)
export async function initDB() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensorType TEXT,
      timestamp INTEGER,
      value REAL
    );
  `);
}

// Insert a reading asynchronously
export async function insertReading(sensorType: SensorType, timestamp: number, value: number) {
  const db = await dbPromise;
  await db.runAsync('INSERT INTO readings (sensorType, timestamp, value) VALUES (?, ?, ?)', [
    sensorType,
    timestamp,
    value,
  ]);
}

export async function getReadings(sensorType?: SensorType) {
  const db = await dbPromise;
  if (sensorType) {
    return await db.getAllAsync(
      'SELECT * FROM readings WHERE sensorType = ? ORDER BY timestamp DESC LIMIT 30',
      [sensorType]
    );
  }
  return await db.getAllAsync('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 30');
}
