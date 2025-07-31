#!/usr/bin/env node

import * as readline from 'readline';
import { spawn, ChildProcess } from 'child_process';
import { ConfigManager } from './config';
import { DatabaseManager } from './database';
import { AIManager } from './ai';
import { CompletionManager } from './completion';

class SQLite3AICLI {
  private config: ConfigManager;
  private db: DatabaseManager;
  private ai: AIManager;
  private completion: CompletionManager;
  private rl: readline.Interface;
  private sqlite3Process: ChildProcess | null = null;
  private currentStatement: string = '';
  private inMultiLineStatement: boolean = false;

  constructor() {
    this.config = new ConfigManager();
    this.db = new DatabaseManager();
    this.ai = new AIManager(this.config, this.db);
    this.completion = new CompletionManager(this.db);
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'sqlite> ',
      completer: this.handleTabCompletion.bind(this)
    });
  }

  handleTabCompletion(line: string, callback: (err: any, result?: [string[], string]) => void): void {
    this.completion.getCompletions(line, line.length)
      .then(result => {
        callback(null, [result.completions, result.partialWord]);
      })
      .catch(error => {
        callback(null, [[], '']);
      });
  }

  private async handleDotCommand(command: string): Promise<boolean> {
    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case '.model':
        if (args.length === 0) {
          console.log(`Current model: ${this.config.getModel()}`);
        } else {
          this.config.setModel(args.join(' '));
          console.log(`Model set to: ${args.join(' ')}`);
        }
        return true;

      case '.anthropic-key':
        if (args.length === 0) {
          const key = this.config.getAnthropicKey();
          console.log(`Current anthropic key: ${key ? '***' + key.slice(-4) : 'not set'}`);
        } else {
          this.config.setAnthropicKey(args.join(' '));
          console.log('Anthropic key set');
        }
        return true;

      case '.ai':
        if (args.length === 0) {
          console.log('Usage: .ai <prompt>');
          return true;
        }

        try {
          const prompt = args.join(' ');
          console.log('Generating SQL...');
          const sql = await this.ai.generateSQL(prompt);
          
          // Replace the current line with the generated SQL
          this.rl.write(null, { ctrl: true, name: 'u' }); // Clear line
          this.rl.write(sql);
          
        } catch (error) {
          console.error('AI Error:', error instanceof Error ? error.message : String(error));
        }
        return true;

      default:
        return false; // Not handled, pass to sqlite3
    }
  }

  private async handleInput(input: string): Promise<void> {
    // Handle empty input
    if (!input) {
      if (this.inMultiLineStatement) {
        this.rl.setPrompt('   ...> ');
      } else {
        this.rl.setPrompt('sqlite> ');
      }
      this.rl.prompt();
      return;
    }

    // Handle dot commands immediately (they don't support multi-line)
    if (input.startsWith('.') && !this.inMultiLineStatement) {
      await this.executeCommand(input);
      this.rl.setPrompt('sqlite> ');
      this.rl.prompt();
      return;
    }

    // Add input to current statement
    if (this.inMultiLineStatement) {
      this.currentStatement += '\n' + input;
    } else {
      this.currentStatement = input;
      this.inMultiLineStatement = true;
    }

    // Check if statement is complete (ends with semicolon)
    if (input.endsWith(';')) {
      await this.executeCommand(this.currentStatement);
      this.currentStatement = '';
      this.inMultiLineStatement = false;
      this.rl.setPrompt('sqlite> ');
    } else {
      this.rl.setPrompt('   ...> ');
    }

    this.rl.prompt();
  }

  private async executeCommand(command: string): Promise<void> {
    const trimmed = command.trim();
    
    if (!trimmed) {
      return;
    }

    // Handle our custom dot commands first
    if (trimmed.startsWith('.')) {
      const handled = await this.handleDotCommand(trimmed);
      if (handled) {
        return;
      }
    }

    // Pass everything else to sqlite3
    return new Promise((resolve) => {
      const dbPath = this.db.getDbPath() || ':memory:';
      
      // Always use stdin approach for consistency
      const sqlite3 = spawn('sqlite3', [dbPath]);
      
      sqlite3.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      sqlite3.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      sqlite3.on('close', () => {
        resolve();
      });

      sqlite3.on('error', (error) => {
        console.error('Error executing command:', error.message);
        resolve();
      });

      // Send headers on command first, then the actual command via stdin and close
      sqlite3.stdin.write('.headers on\n');
      sqlite3.stdin.write(trimmed);
      sqlite3.stdin.write('\n');
      sqlite3.stdin.end();
    });
  }

  public async start(): Promise<void> {
    // Handle command line arguments
    const args = process.argv.slice(2);
    if (args.length > 0) {
      this.db.setDbPath(args[0]);
      console.log(`Connected to database: ${args[0]}`);
    } else {
      console.log('Connected to in-memory database');
    }

    console.log('SQLite3 AI CLI - Type .help for help, .ai <prompt> for AI assistance');
    console.log(`Model: ${this.config.getModel()}`);
    console.log(`API Key: ${this.config.getAnthropicKey() ? 'Set' : 'Not set'}`);
    console.log('');

    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const trimmed = input.trim();
      
      if (trimmed === '.quit' || trimmed === '.exit') {
        this.rl.close();
        return;
      }

      await this.handleInput(trimmed);
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });

    // Handle Ctrl+C
    this.rl.on('SIGINT', () => {
      if (this.inMultiLineStatement) {
        console.log('\nCancelling current statement...');
        this.currentStatement = '';
        this.inMultiLineStatement = false;
        this.rl.setPrompt('sqlite> ');
      } else {
        console.log('\nUse .quit or .exit to quit');
      }
      this.rl.prompt();
    });
  }
}

// Start the CLI
const cli = new SQLite3AICLI();
cli.start().catch((error) => {
  console.error('Failed to start CLI:', error);
  process.exit(1);
});
