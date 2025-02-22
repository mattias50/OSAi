import { FileIntelligence } from './core/FileIntelligence.js';
import { Alert, MonitorConfig } from './types/index.js';
import path from 'path';

// Default configuration
const defaultConfig: MonitorConfig = {
  watchPaths: [process.cwd()],
  excludePaths: ['**/node_modules/**', '**/.git/**'],
  updateInterval: 1000,
  alertThresholds: {
    performance: 0.8,
    security: 0.7,
    anomaly: 0.6
  },
  relationshipStrengthThreshold: 0.5,
  maxStorageSize: 1024 * 1024 * 100, // 100MB
  retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
};

class OSAiMonitor {
  private intelligence: FileIntelligence;

  constructor(config: Partial<MonitorConfig> = {}) {
    // Merge default config with provided config
    const finalConfig: MonitorConfig = {
      ...defaultConfig,
      ...config,
      // Ensure paths are absolute
      watchPaths: (config.watchPaths || defaultConfig.watchPaths).map(p => 
        path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
      )
    };

    this.intelligence = new FileIntelligence(finalConfig);
    this.setupAlertHandling();
  }

  private setupAlertHandling(): void {
    this.intelligence.onAlert((alert: Alert) => {
      this.handleAlert(alert);
    });
  }

  private handleAlert(alert: Alert): void {
    // Format the alert message for console output
    const timestamp = alert.timestamp.toISOString();
    const severity = alert.severity.toUpperCase();
    const message = `[${timestamp}] ${severity}: ${alert.message}`;
    
    // Color-code based on severity
    switch (alert.severity) {
      case 'critical':
        console.error('\x1b[31m%s\x1b[0m', message); // Red
        break;
      case 'error':
        console.error('\x1b[31m%s\x1b[0m', message); // Red
        break;
      case 'warning':
        console.warn('\x1b[33m%s\x1b[0m', message);  // Yellow
        break;
      case 'info':
        console.info('\x1b[36m%s\x1b[0m', message);  // Cyan
        break;
    }

    // Log additional context if available
    if (alert.context) {
      console.log(`  Context: ${alert.context}`);
    }
    
    if (alert.relatedFiles.length > 0) {
      console.log('  Related Files:');
      alert.relatedFiles.forEach(file => console.log(`    - ${file}`));
    }
    
    if (alert.suggestedActions.length > 0) {
      console.log('  Suggested Actions:');
      alert.suggestedActions.forEach(action => console.log(`    - ${action}`));
    }
  }

  public async stop(): Promise<void> {
    await this.intelligence.stop();
  }
}

// Create and export the monitor instance
const monitor = new OSAiMonitor();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nShutting down OSAi Monitor...');
  await monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down OSAi Monitor...');
  await monitor.stop();
  process.exit(0);
});

export { OSAiMonitor, monitor as default };