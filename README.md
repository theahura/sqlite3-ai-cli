# SQLite3 AI CLI

A thin wrapper over the SQLite3 CLI with AI integration and tab completion.

## Features

- **Full SQLite3 compatibility**: All standard SQLite3 commands work as usual (`.table`, `.headers on`, SQL queries, etc.)
- **Tab completion**: Intelligent completion for SQL keywords and table names
- **AI integration**: Generate SQL queries using natural language with the `.ai` command
- **Model configuration**: Configure which AI model to use with `.model`
- **API key management**: Securely store your Anthropic API key with `.anthropic-key`

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Connect to a database file
npm start [database.db]

# Or run in development mode
npm run dev [database.db]
```

## Commands

### Standard SQLite3 Commands
All standard SQLite3 commands work as usual:
- `.tables` - List all tables
- `.schema` - Show table schemas
- `.headers on/off` - Toggle column headers
- Any SQL query (SELECT, INSERT, UPDATE, DELETE, etc.)

### AI-Enhanced Commands

#### `.model [model-name]`
Set or view the current AI model.
```sql
.model                           -- View current model
.model claude-sonnet-4-20250514  -- Set model
```

#### `.anthropic-key [api-key]`
Set or view the current Anthropic API key.
```sql
.anthropic-key              -- View current key (masked)
.anthropic-key sk-ant-...   -- Set API key
```

#### `.ai <prompt>`
Generate SQL using natural language. The AI has access to your database schema.
```sql
.ai show all users
.ai find the top 10 customers by total orders
.ai create a table for storing product reviews
```

## Tab Completion

Press Tab to see completions:
- After typing `sel` + Tab → `SELECT`
- After typing `SELECT * FROM ` + Tab → shows available tables
- After typing `.` + Tab → shows dot commands

## Examples

```sql
-- Set up AI
.model claude-sonnet-4-20250514
.anthropic-key sk-ant-your-key-here

-- Use AI to generate queries
.ai show me all customers from California
-- This might generate: SELECT * FROM customers WHERE state = 'California';

-- Standard SQLite3 usage still works
.tables
.schema customers
SELECT COUNT(*) FROM customers;
```

## Configuration

Configuration is stored in `~/.sqlite3-ai-cli/config.json` and includes:
- AI model selection
- Anthropic API key (encrypted storage recommended for production use)