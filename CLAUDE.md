# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run build` - Compile TypeScript to JavaScript in `dist/` directory
- `npm run dev [database.db]` - Run development version with ts-node
- `npm start [database.db]` - Run compiled version from `dist/`
- `npm install` - Install dependencies

## Project Architecture

This is a CLI wrapper around SQLite3 that adds AI-powered query generation and tab completion. The architecture follows a modular design:

### Core Components

- **SQLite3AICLI** (`index.ts`) - Main CLI class orchestrating all components
- **ConfigManager** (`config.ts`) - Handles user configuration in `~/.sqlite3-ai-cli/config.json`
- **DatabaseManager** (`database.ts`) - Wraps SQLite3 CLI via child processes for schema introspection
- **AIManager** (`ai.ts`) - Integrates with Anthropic API for SQL generation
- **CompletionManager** (`completion.ts`) - Provides tab completion for SQL keywords and table names

### Key Design Patterns

- **Child Process Delegation**: All actual SQLite3 operations are delegated to the native `sqlite3` CLI via `spawn()`
- **Async Command Handling**: Custom dot commands (`.ai`, `.model`, `.anthropic-key`) are handled by the wrapper, everything else passes through to SQLite3
- **Schema-Aware AI**: AI queries include current database schema for accurate SQL generation
- **Persistent Configuration**: Settings stored in user home directory with automatic creation

### Data Flow

1. User input → readline interface with tab completion
2. Custom dot commands → respective managers
3. Standard SQL/SQLite commands → spawned `sqlite3` process
4. AI requests → schema introspection → Anthropic API → generated SQL inserted into input line

### Dependencies

- **@anthropic-ai/sdk**: AI integration
- **readline**: Interactive CLI with tab completion
- **child_process**: SQLite3 process spawning
- Requires system `sqlite3` binary

### Configuration Structure

Config stored in `~/.sqlite3-ai-cli/config.json`:
```json
{
  "model": "claude-sonnet-4-20250514",
  "anthropicKey": "sk-ant-..."
}
```

### Custom Commands

- `.ai <prompt>` - Generate SQL from natural language
- `.model [name]` - View/set AI model
- `.anthropic-key [key]` - View/set API key
- All standard SQLite3 commands pass through unchanged