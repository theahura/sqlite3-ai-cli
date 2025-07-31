"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const child_process_1 = require("child_process");
class DatabaseManager {
    constructor(dbPath = '') {
        this.sqlite3Process = null;
        this.dbPath = dbPath;
    }
    async getTables() {
        return new Promise((resolve, reject) => {
            const args = [this.dbPath || ':memory:', '.tables'];
            const sqlite3 = (0, child_process_1.spawn)('sqlite3', args);
            let output = '';
            sqlite3.stdout.on('data', (data) => {
                output += data.toString();
            });
            sqlite3.on('close', (code) => {
                if (code === 0) {
                    const tables = output.trim().split(/\s+/).filter(t => t.length > 0);
                    resolve(tables);
                }
                else {
                    reject(new Error(`sqlite3 exited with code ${code}`));
                }
            });
            sqlite3.on('error', reject);
        });
    }
    async getTableSchema(tableName) {
        return new Promise((resolve, reject) => {
            const args = [this.dbPath || ':memory:', `.schema ${tableName}`];
            const sqlite3 = (0, child_process_1.spawn)('sqlite3', args);
            let output = '';
            sqlite3.stdout.on('data', (data) => {
                output += data.toString();
            });
            sqlite3.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                }
                else {
                    reject(new Error(`sqlite3 exited with code ${code}`));
                }
            });
            sqlite3.on('error', reject);
        });
    }
    async getAllSchemas() {
        try {
            const tables = await this.getTables();
            const schemas = [];
            for (const table of tables) {
                try {
                    const schema = await this.getTableSchema(table);
                    schemas.push({ name: table, schema });
                }
                catch (error) {
                    console.error(`Error getting schema for table ${table}:`, error);
                }
            }
            return schemas;
        }
        catch (error) {
            console.error('Error getting schemas:', error);
            return [];
        }
    }
    setDbPath(path) {
        this.dbPath = path;
    }
    getDbPath() {
        return this.dbPath;
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map