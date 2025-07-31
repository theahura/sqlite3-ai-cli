"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIManager = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AIManager {
    constructor(config, db) {
        this.config = config;
        this.db = db;
    }
    async generateSQL(prompt) {
        const anthropicKey = this.config.getAnthropicKey();
        if (!anthropicKey) {
            throw new Error('Anthropic API key not set. Use .anthropic-key <key> to set it.');
        }
        const anthropic = new sdk_1.default({
            apiKey: anthropicKey,
        });
        const schemas = await this.db.getAllSchemas();
        const systemPrompt = this.buildSystemPrompt(schemas);
        try {
            const message = await anthropic.messages.create({
                model: this.config.getModel(),
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
            const content = message.content[0];
            if (content.type === 'text') {
                return content.text.trim();
            }
            else {
                throw new Error('Unexpected response format from Anthropic API');
            }
        }
        catch (error) {
            throw new Error(`AI request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    buildSystemPrompt(schemas) {
        let prompt = `You are a SQL assistant. Generate only valid SQL queries based on the user's request. 

IMPORTANT RULES:
1. Return ONLY the SQL query, no explanations or markdown formatting
2. The SQL must be valid SQLite syntax
3. Use only the tables and columns that exist in the database

Database Schema:
`;
        if (schemas.length === 0) {
            prompt += "No tables found in the database.";
        }
        else {
            for (const table of schemas) {
                prompt += `\nTable: ${table.name}\n${table.schema}\n`;
            }
        }
        prompt += `\n\nRespond with only the SQL query that answers the user's request.`;
        return prompt;
    }
}
exports.AIManager = AIManager;
//# sourceMappingURL=ai.js.map