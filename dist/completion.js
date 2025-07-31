"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionManager = void 0;
class CompletionManager {
    constructor(db) {
        this.sqlKeywords = [
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
            'ALTER', 'INDEX', 'TABLE', 'DATABASE', 'DISTINCT', 'ORDER', 'BY', 'GROUP',
            'HAVING', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS', 'AND',
            'OR', 'NOT', 'NULL', 'TRUE', 'FALSE', 'LIKE', 'BETWEEN', 'IN', 'EXISTS',
            'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE',
            'END', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'LIMIT',
            'OFFSET', 'VALUES', 'INTO', 'SET'
        ];
        this.db = db;
    }
    async getCompletions(line, cursorPos) {
        const beforeCursor = line.substring(0, cursorPos);
        const words = beforeCursor.split(/\s+/);
        const currentWord = words[words.length - 1] || '';
        // Handle dot commands
        if (beforeCursor.startsWith('.')) {
            const dotCompletions = this.getDotCommandCompletions(currentWord);
            return { completions: dotCompletions, partialWord: currentWord };
        }
        const completions = [];
        // Add SQL keyword completions
        for (const keyword of this.sqlKeywords) {
            if (keyword.toLowerCase().startsWith(currentWord.toLowerCase())) {
                completions.push(keyword);
            }
        }
        // Add table name completions after FROM, JOIN, etc.
        if (this.shouldShowTableCompletions(beforeCursor)) {
            try {
                const tables = await this.db.getTables();
                for (const table of tables) {
                    if (table.toLowerCase().startsWith(currentWord.toLowerCase())) {
                        completions.push(table);
                    }
                }
            }
            catch (error) {
                // Ignore errors when getting table completions
            }
        }
        return { completions: completions.sort(), partialWord: currentWord };
    }
    getDotCommandCompletions(currentWord) {
        const dotCommands = [
            '.ai', '.anthropic-key', '.model', '.tables', '.schema', '.headers',
            '.mode', '.output', '.quit', '.exit', '.help', '.backup', '.restore'
        ];
        return dotCommands.filter(cmd => cmd.toLowerCase().startsWith(currentWord.toLowerCase()));
    }
    shouldShowTableCompletions(text) {
        const lowerText = text.toLowerCase();
        const fromRegex = /\bfrom\s+\w*$/i;
        const joinRegex = /\bjoin\s+\w*$/i;
        const updateRegex = /\bupdate\s+\w*$/i;
        const intoRegex = /\binto\s+\w*$/i;
        return fromRegex.test(lowerText) ||
            joinRegex.test(lowerText) ||
            updateRegex.test(lowerText) ||
            intoRegex.test(lowerText);
    }
}
exports.CompletionManager = CompletionManager;
//# sourceMappingURL=completion.js.map