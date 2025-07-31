"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CONFIG_DIR = path.join(os.homedir(), '.sqlite3-ai-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG = {
    model: 'claude-sonnet-4-20250514',
    anthropicKey: ''
};
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }
    loadConfig() {
        try {
            if (!fs.existsSync(CONFIG_DIR)) {
                fs.mkdirSync(CONFIG_DIR, { recursive: true });
            }
            if (fs.existsSync(CONFIG_FILE)) {
                const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
                return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
            }
        }
        catch (error) {
            console.error('Error loading config:', error);
        }
        return { ...DEFAULT_CONFIG };
    }
    saveConfig() {
        try {
            if (!fs.existsSync(CONFIG_DIR)) {
                fs.mkdirSync(CONFIG_DIR, { recursive: true });
            }
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Error saving config:', error);
        }
    }
    getModel() {
        return this.config.model;
    }
    setModel(model) {
        this.config.model = model;
        this.saveConfig();
    }
    getAnthropicKey() {
        return this.config.anthropicKey;
    }
    setAnthropicKey(key) {
        this.config.anthropicKey = key;
        this.saveConfig();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map