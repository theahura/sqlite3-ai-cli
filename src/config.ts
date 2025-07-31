import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Config {
  model: string;
  anthropicKey: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.sqlite3-ai-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  model: 'claude-sonnet-4-20250514',
  anthropicKey: ''
};

export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }

      if (fs.existsSync(CONFIG_FILE)) {
        const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }

    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(): void {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  getModel(): string {
    return this.config.model;
  }

  setModel(model: string): void {
    this.config.model = model;
    this.saveConfig();
  }

  getAnthropicKey(): string {
    return this.config.anthropicKey;
  }

  setAnthropicKey(key: string): void {
    this.config.anthropicKey = key;
    this.saveConfig();
  }
}