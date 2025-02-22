#!/usr/bin/env node
import { CommandInterpreter } from './nlp/CommandInterpreter.js';
import { ScriptMonitor } from './execution/ScriptMonitor.js';
import path from 'path';

const defaultConfig = {
  watchPaths: [process.cwd()],
  excludePaths: ['**/node_modules/**', '**/.git/**', '**/__pycache__/**', '**/*.pyc'],
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

class MonitorCLI {
  private interpreter: CommandInterpreter;
  private monitor: ScriptMonitor;

  constructor() {
    this.interpreter = new CommandInterpreter();
    this.monitor = new ScriptMonitor(defaultConfig);
  }

  async processCommand(command: string): Promise<void> {
    try {
      console.log('\x1b[36m%s\x1b[0m', 'Processing command:', command);
      
      const intent = await this.interpreter.interpretCommand(command);
      
      if (intent.confidence < 0.8) {
        console.log('\x1b[33m%s\x1b[0m', 'Warning: Command interpretation confidence is low. Please be more specific.');
        return;
      }

      if (intent.action === 'monitor' && intent.target === 'script') {
        const scriptPath = path.resolve(process.cwd(), intent.parameters.path || 'app.py');
        console.log('\x1b[36m%s\x1b[0m', `Monitoring script execution: ${scriptPath}`);
        
        const context = await this.monitor.monitorScript(scriptPath);
        
        console.log('\n\x1b[32m%s\x1b[0m', 'Execution completed!');
        console.log('\x1b[36m%s\x1b[0m', 'Summary:');
        console.log(`Duration: ${(context.endTime!.getTime() - context.startTime.getTime()) / 1000}s`);
        console.log(`Exit code: ${context.exitCode}`);
        console.log(`File operations: ${context.fileOperations.length}`);
        console.log(`Dependencies: ${context.dependencies.join(', ')}`);
        
        if (context.errorLog.length > 0) {
          console.log('\n\x1b[31m%s\x1b[0m', 'Errors:');
          context.errorLog.forEach(error => console.log(`  ${error}`));
        }
        
        console.log('\n\x1b[36m%s\x1b[0m', 'A detailed report has been generated in the script directory.');
      } else {
        console.log('\x1b[31m%s\x1b[0m', 'Unsupported command. Please use commands like:');
        console.log('  - "monitor script app.py"');
        console.log('  - "check and monitor files when running app.py"');
        console.log('  - "track file operations during script execution"');
      }
    } catch (error: unknown) {
      console.error('\x1b[31m%s\x1b[0m', 'Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await this.monitor.stop();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\x1b[31m%s\x1b[0m', 'Please provide a command. Examples:');
  console.log('  osai-monitor "monitor script app.py"');
  console.log('  osai-monitor "check and monitor files when running app.py"');
  process.exit(1);
}

const cli = new MonitorCLI();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nShutting down OSAi Monitor...');
  await cli.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down OSAi Monitor...');
  await cli.stop();
  process.exit(0);
});

// Process the command
cli.processCommand(args.join(' ')).catch(error => {
  console.error('\x1b[31m%s\x1b[0m', 'Fatal error:', error);
  process.exit(1);
});