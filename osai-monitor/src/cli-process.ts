#!/usr/bin/env node
import { CommandInterpreter } from './nlp/CommandInterpreter.js';
import { ProcessIntelligence } from './process/ProcessIntelligence.js';

const defaultConfig = {
  updateInterval: 5000,  // 5 seconds
  learningPeriod: 24 * 60 * 60 * 1000  // 24 hours
};

class ProcessCLI {
  private interpreter: CommandInterpreter;
  private processIntelligence: ProcessIntelligence;

  constructor() {
    this.interpreter = new CommandInterpreter();
    this.processIntelligence = new ProcessIntelligence(defaultConfig);
  }

  async processCommand(command: string): Promise<void> {
    try {
      console.log('\x1b[36m%s\x1b[0m', 'Processing command:', command);
      
      const intent = await this.interpreter.interpretCommand(command);
      
      if (intent.confidence < 0.8) {
        console.log('\x1b[33m%s\x1b[0m', 'Warning: Command interpretation confidence is low. Please be more specific.');
        return;
      }

      switch (intent.action) {
        case 'monitor':
          await this.handleMonitorCommand(intent);
          break;
        case 'analyze':
          await this.handleAnalyzeCommand(intent);
          break;
        case 'check':
          await this.handleCheckCommand(intent);
          break;
        case 'explain':
          await this.handleExplainCommand(intent);
          break;
        default:
          console.log('\x1b[31m%s\x1b[0m', 'Unsupported command. Try commands like:');
          this.showExampleCommands();
      }
    } catch (error: unknown) {
      console.error('\x1b[31m%s\x1b[0m', 'Error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handleMonitorCommand(intent: any): Promise<void> {
    const pid = parseInt(intent.parameters.pid);
    if (isNaN(pid)) {
      console.log('\x1b[31m%s\x1b[0m', 'Please specify a valid process ID');
      return;
    }

    const context = await this.processIntelligence.getProcessContext(pid);
    if (!context) {
      console.log('\x1b[31m%s\x1b[0m', `No process found with PID ${pid}`);
      return;
    }

    console.log('\x1b[36m%s\x1b[0m', `Monitoring process ${pid} (${context.name})`);
    console.log('\nCurrent Metrics:');
    console.log(`  CPU Usage: ${context.metrics.cpu}%`);
    console.log(`  Memory Usage: ${context.metrics.memory}MB`);
    console.log(`  Threads: ${context.metrics.threads}`);
    console.log(`  Open Files: ${context.metrics.openFiles}`);
    console.log(`  Network Connections: ${context.metrics.networkConnections}`);
  }

  private async handleAnalyzeCommand(intent: any): Promise<void> {
    const pid = parseInt(intent.parameters.pid);
    if (isNaN(pid)) {
      console.log('\x1b[31m%s\x1b[0m', 'Please specify a valid process ID');
      return;
    }

    const context = await this.processIntelligence.getProcessContext(pid);
    if (!context) {
      console.log('\x1b[31m%s\x1b[0m', `No process found with PID ${pid}`);
      return;
    }

    console.log('\x1b[36m%s\x1b[0m', `Analysis for process ${pid} (${context.name})`);
    console.log('\nBehavior Patterns:');
    console.log('  CPU Usage:', this.formatRange(context.behavior.normalPatterns.cpuUsage));
    console.log('  Memory Usage:', this.formatRange(context.behavior.normalPatterns.memoryUsage));
    console.log('  File Operations:', this.formatRange(context.behavior.normalPatterns.fileOperations));
    console.log('  Network Activity:', this.formatRange(context.behavior.normalPatterns.networkActivity));

    const anomalies = await this.processIntelligence.getProcessAnomalies(pid);
    if (anomalies.length > 0) {
      console.log('\nDetected Anomalies:');
      anomalies.forEach(anomaly => {
        console.log(`  [${anomaly.severity.toUpperCase()}] ${anomaly.description}`);
        console.log(`    Detected at: ${anomaly.timestamp.toISOString()}`);
      });
    }
  }

  private async handleCheckCommand(intent: any): Promise<void> {
    const pid = parseInt(intent.parameters.pid);
    if (isNaN(pid)) {
      console.log('\x1b[31m%s\x1b[0m', 'Please specify a valid process ID');
      return;
    }

    const relationships = await this.processIntelligence.getProcessRelationships(pid);
    console.log('\x1b[36m%s\x1b[0m', `Process relationships for PID ${pid}:`);
    relationships.forEach(rel => {
      console.log(`  ${rel.type.toUpperCase()}: Process ${rel.targetPid} (${rel.description})`);
    });
  }

  private async handleExplainCommand(intent: any): Promise<void> {
    const pid = parseInt(intent.parameters.pid);
    if (isNaN(pid)) {
      console.log('\x1b[31m%s\x1b[0m', 'Please specify a valid process ID');
      return;
    }

    const context = await this.processIntelligence.getProcessContext(pid);
    if (!context) {
      console.log('\x1b[31m%s\x1b[0m', `No process found with PID ${pid}`);
      return;
    }

    console.log('\x1b[36m%s\x1b[0m', `Explanation for process ${pid} (${context.name})`);
    console.log('\nProcess Information:');
    console.log(`  Command: ${context.command}`);
    console.log(`  User: ${context.user}`);
    console.log(`  Started: ${context.startTime.toISOString()}`);
    
    const relationships = await this.processIntelligence.getProcessRelationships(pid);
    if (relationships.length > 0) {
      console.log('\nRelationships:');
      relationships.forEach(rel => {
        console.log(`  - ${this.formatRelationship(rel)}`);
      });
    }

    if (context.behavior.anomalies.length > 0) {
      console.log('\nRecent Behavior:');
      context.behavior.anomalies.slice(-5).forEach(anomaly => {
        console.log(`  - ${anomaly.description} (${anomaly.timestamp.toISOString()})`);
      });
    }
  }

  private formatRange(range: { min: number; max: number; average: number }): string {
    return `min: ${range.min.toFixed(2)}, max: ${range.max.toFixed(2)}, avg: ${range.average.toFixed(2)}`;
  }

  private formatRelationship(rel: { type: string; targetPid: number; description: string }): string {
    return `${rel.type.charAt(0).toUpperCase() + rel.type.slice(1)} process ${rel.targetPid} (${rel.description})`;
  }

  private showExampleCommands(): void {
    console.log('  - "monitor process 1234"');
    console.log('  - "analyze behavior of process 5678"');
    console.log('  - "check relationships for process 1234"');
    console.log('  - "explain what process 5678 is doing"');
    console.log('  - "show anomalies for process 1234"');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\x1b[31m%s\x1b[0m', 'Please provide a command. Examples:');
  console.log('  osai-process "monitor process 1234"');
  console.log('  osai-process "analyze behavior of process 5678"');
  process.exit(1);
}

const cli = new ProcessCLI();

// Process the command
cli.processCommand(args.join(' ')).catch(error => {
  console.error('\x1b[31m%s\x1b[0m', 'Fatal error:', error);
  process.exit(1);
});