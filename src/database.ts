import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';

export interface TableInfo {
  name: string;
  schema: string;
}

export class DatabaseManager {
  private dbPath: string;
  private sqlite3Process: ChildProcess | null = null;

  constructor(dbPath: string = '') {
    this.dbPath = dbPath;
  }

  async getTables(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const args = [this.dbPath || ':memory:', '.tables'];
      const sqlite3 = spawn('sqlite3', args);
      
      let output = '';
      sqlite3.stdout.on('data', (data) => {
        output += data.toString();
      });

      sqlite3.on('close', (code) => {
        if (code === 0) {
          const tables = output.trim().split(/\s+/).filter(t => t.length > 0);
          resolve(tables);
        } else {
          reject(new Error(`sqlite3 exited with code ${code}`));
        }
      });

      sqlite3.on('error', reject);
    });
  }

  async getTableSchema(tableName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [this.dbPath || ':memory:', `.schema ${tableName}`];
      const sqlite3 = spawn('sqlite3', args);
      
      let output = '';
      sqlite3.stdout.on('data', (data) => {
        output += data.toString();
      });

      sqlite3.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`sqlite3 exited with code ${code}`));
        }
      });

      sqlite3.on('error', reject);
    });
  }

  async getAllSchemas(): Promise<TableInfo[]> {
    try {
      const tables = await this.getTables();
      const schemas: TableInfo[] = [];
      
      for (const table of tables) {
        try {
          const schema = await this.getTableSchema(table);
          schemas.push({ name: table, schema });
        } catch (error) {
          console.error(`Error getting schema for table ${table}:`, error);
        }
      }
      
      return schemas;
    } catch (error) {
      console.error('Error getting schemas:', error);
      return [];
    }
  }

  setDbPath(path: string): void {
    this.dbPath = path;
  }

  getDbPath(): string {
    return this.dbPath;
  }
}