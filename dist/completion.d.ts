import { DatabaseManager } from './database';
export declare class CompletionManager {
    private db;
    private sqlKeywords;
    constructor(db: DatabaseManager);
    getCompletions(line: string, cursorPos: number): Promise<{
        completions: string[];
        partialWord: string;
    }>;
    private getDotCommandCompletions;
    private shouldShowTableCompletions;
}
//# sourceMappingURL=completion.d.ts.map