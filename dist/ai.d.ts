import { ConfigManager } from './config';
import { DatabaseManager } from './database';
export declare class AIManager {
    private config;
    private db;
    constructor(config: ConfigManager, db: DatabaseManager);
    generateSQL(prompt: string): Promise<string>;
    private buildSystemPrompt;
}
//# sourceMappingURL=ai.d.ts.map