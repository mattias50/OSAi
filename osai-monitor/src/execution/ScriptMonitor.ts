import { spawn } from 'child_process';
import { FileIntelligence } from '../core/FileIntelligence.js';
import path from 'path';
import fs from 'fs/promises';

interface FileOperation {
  type: 'read' | 'write' | 'create' | 'delete' | 'modify';
  path: string;
  timestamp: Date;
  details?: string;
}

interface ExecutionContext {
  scriptPath: string;
  startTime: Date;
  endTime?: Date;
  exitCode?: number;
  fileOperations: FileOperation[];
  dependencies: string[];
  outputLog: string[];
  errorLog: string[];
}

export class ScriptExecutionError extends Error {
  constructor(message: string, public readonly context?: ExecutionContext) {
    super(message);
    this.name = 'ScriptExecutionError';
  }
}

export class ScriptMonitor {
  private fileIntelligence: FileIntelligence;
  private contexts: Map<string, ExecutionContext> = new Map();

  constructor(config: any) {
    this.fileIntelligence = new FileIntelligence(config);
  }

  async monitorScript(scriptPath: string): Promise<ExecutionContext> {
    const absolutePath = path.resolve(scriptPath);
    const workingDir = path.dirname(absolutePath);

    // Create execution context
    const context: ExecutionContext = {
      scriptPath: absolutePath,
      startTime: new Date(),
      fileOperations: [],
      dependencies: [],
      outputLog: [],
      errorLog: []
    };

    this.contexts.set(absolutePath, context);

    try {
      // Analyze script for imports before execution
      await this.analyzeScriptDependencies(absolutePath, context);

      // Set up file monitoring for the script's directory
      this.fileIntelligence.onAlert(alert => {
        const operation: FileOperation = {
          type: this.mapAlertTypeToOperation(alert.type),
          path: alert.relatedFiles[0],
          timestamp: alert.timestamp,
          details: alert.message
        };
        context.fileOperations.push(operation);
      });

      // Execute the script and monitor its output
      const result = await this.executeScript(absolutePath, context);
      
      // Update context with execution results
      context.endTime = new Date();
      context.exitCode = result.exitCode;

      // Generate execution report
      await this.generateExecutionReport(context);

      return context;
    } catch (error: unknown) {
      context.endTime = new Date();
      context.exitCode = 1;
      context.errorLog.push(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
      throw new ScriptExecutionError(
        `Failed to execute script: ${error instanceof Error ? error.message : String(error)}`,
        context
      );
    }
  }

  private async analyzeScriptDependencies(scriptPath: string, context: ExecutionContext): Promise<void> {
    const content = await fs.readFile(scriptPath, 'utf-8');
    
    // Regular expressions for different types of Python imports
    const importPatterns = [
      /^import\s+(\w+)/gm,
      /^from\s+(\w+)\s+import/gm,
      /^import\s+(\w+)\s+as/gm
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        context.dependencies.push(match[1]);
      }
    }
  }

  private async executeScript(scriptPath: string, context: ExecutionContext): Promise<{ exitCode: number }> {
    return new Promise((resolve, reject) => {
      const python = spawn('python', [scriptPath]);

      python.stdout.on('data', (data) => {
        const output = data.toString();
        context.outputLog.push(output);
      });

      python.stderr.on('data', (data) => {
        const error = data.toString();
        context.errorLog.push(error);
      });

      python.on('close', (code) => {
        resolve({ exitCode: code ?? 0 });
      });

      python.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async generateExecutionReport(context: ExecutionContext): Promise<void> {
    const reportPath = path.join(
      path.dirname(context.scriptPath),
      `execution-report-${Date.now()}.json`
    );

    const report = {
      script: context.scriptPath,
      execution: {
        startTime: context.startTime,
        endTime: context.endTime,
        duration: context.endTime 
          ? (context.endTime.getTime() - context.startTime.getTime()) / 1000
          : null,
        exitCode: context.exitCode
      },
      dependencies: context.dependencies,
      fileOperations: context.fileOperations.map(op => ({
        ...op,
        timestamp: op.timestamp.toISOString()
      })),
      output: context.outputLog,
      errors: context.errorLog
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  private mapAlertTypeToOperation(alertType: string): FileOperation['type'] {
    switch (alertType) {
      case 'create':
        return 'create';
      case 'modify':
        return 'modify';
      case 'delete':
        return 'delete';
      case 'read':
        return 'read';
      default:
        return 'modify';
    }
  }

  async stop(): Promise<void> {
    await this.fileIntelligence.stop();
  }
}