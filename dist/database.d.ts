export interface TableInfo {
    name: string;
    schema: string;
}
export declare class DatabaseManager {
    private dbPath;
    private sqlite3Process;
    constructor(dbPath?: string);
    getTables(): Promise<string[]>;
    getTableSchema(tableName: string): Promise<string>;
    getAllSchemas(): Promise<TableInfo[]>;
    setDbPath(path: string): void;
    getDbPath(): string;
}
//# sourceMappingURL=database.d.ts.map