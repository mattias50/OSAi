import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

interface ProcessMetrics {
  cpu: number;
  memory: number;
  threads: number;
  openFiles: number;
  networkConnections: number;
}

interface ProcessContext {
  pid: number;
  name: string;
  command: string;
  startTime: Date;
  user: string;
  metrics: ProcessMetrics;
  relationships: ProcessRelationship[];
  behavior: ProcessBehavior;
}

interface ProcessRelationship {
  type: 'parent' | 'child' | 'sibling' | 'communicates_with';
  targetPid: number;
  description: string;
}

interface ProcessBehavior {
  normalPatterns: {
    cpuUsage: Range;
    memoryUsage: Range;
    fileOperations: Range;
    networkActivity: Range;
  };
  anomalies: ProcessAnomaly[];
  learningPeriod: boolean;
}

interface Range {
  min: number;
  max: number;
  average: number;
}

interface ProcessAnomaly {
  type: 'cpu' | 'memory' | 'files' | 'network' | 'behavior';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  metrics: Partial<ProcessMetrics>;
}

export class ProcessIntelligence {
  private processes: Map<number, ProcessContext> = new Map();
  private updateInterval: number;
  private learningPeriod: number;

  constructor(config: {
    updateInterval?: number;
    learningPeriod?: number;
  } = {}) {
    this.updateInterval = config.updateInterval || 5000; // 5 seconds
    this.learningPeriod = config.learningPeriod || 24 * 60 * 60 * 1000; // 24 hours
    this.startMonitoring();
  }

  private async startMonitoring(): Promise<void> {
    setInterval(async () => {
      await this.updateProcesses();
      this.analyzeProcessBehavior();
      this.detectAnomalies();
    }, this.updateInterval);
  }

  private async updateProcesses(): Promise<void> {
    const processes = await this.getRunningProcesses();
    
    for (const proc of processes) {
      if (!this.processes.has(proc.pid)) {
        // New process discovered
        this.processes.set(proc.pid, {
          ...proc,
          startTime: new Date(),
          relationships: await this.detectProcessRelationships(proc.pid),
          behavior: this.initializeBehavior(),
          metrics: await this.collectProcessMetrics(proc.pid)
        });
      } else {
        // Update existing process
        const context = this.processes.get(proc.pid)!;
        context.metrics = await this.collectProcessMetrics(proc.pid);
        context.relationships = await this.detectProcessRelationships(proc.pid);
      }
    }

    // Remove terminated processes
    for (const [pid] of this.processes) {
      if (!processes.some(p => p.pid === pid)) {
        this.processes.delete(pid);
      }
    }
  }

  private async getRunningProcesses(): Promise<Array<Pick<ProcessContext, 'pid' | 'name' | 'command' | 'user'>>> {
    try {
      const { stdout } = await execAsync(
        os.platform() === 'win32'
          ? 'tasklist /FO CSV'
          : 'ps -eo pid,comm,cmd,user'
      );

      return this.parseProcessList(stdout);
    } catch (error) {
      console.error('Failed to get process list:', error);
      return [];
    }
  }

  private async collectProcessMetrics(pid: number): Promise<ProcessMetrics> {
    try {
      const { stdout: cpuInfo } = await execAsync(
        os.platform() === 'win32'
          ? `wmic process where ProcessId=${pid} get WorkingSetSize,ThreadCount`
          : `ps -p ${pid} -o %cpu,%mem,nlwp`
      );

      const { stdout: fdInfo } = await execAsync(
        os.platform() === 'win32'
          ? `handle -p ${pid}`
          : `lsof -p ${pid} | wc -l`
      );

      const { stdout: netInfo } = await execAsync(
        os.platform() === 'win32'
          ? `netstat -ano | findstr ${pid}`
          : `lsof -i -a -p ${pid} | wc -l`
      );

      // Parse the outputs and return metrics
      return {
        cpu: this.parseCpuUsage(cpuInfo),
        memory: this.parseMemoryUsage(cpuInfo),
        threads: this.parseThreadCount(cpuInfo),
        openFiles: this.parseFileCount(fdInfo),
        networkConnections: this.parseNetworkConnections(netInfo)
      };
    } catch (error) {
      // Return default metrics if collection fails
      return {
        cpu: 0,
        memory: 0,
        threads: 0,
        openFiles: 0,
        networkConnections: 0
      };
    }
  }

  private async detectProcessRelationships(pid: number): Promise<ProcessRelationship[]> {
    const relationships: ProcessRelationship[] = [];
    
    try {
      // Get parent-child relationships
      const { stdout: ppidInfo } = await execAsync(
        os.platform() === 'win32'
          ? `wmic process where ProcessId=${pid} get ParentProcessId`
          : `ps -p ${pid} -o ppid=`
      );

      const ppid = parseInt(ppidInfo.trim());
      if (!isNaN(ppid) && ppid > 0) {
        relationships.push({
          type: 'parent',
          targetPid: ppid,
          description: 'Parent process'
        });
      }

      // Get communication relationships through shared resources
      const { stdout: ipcInfo } = await execAsync(
        os.platform() === 'win32'
          ? `handle -p ${pid}`
          : `lsof -p ${pid}`
      );

      // Analyze IPC and add relationships
      // This is a simplified version - in reality, you'd want more sophisticated IPC detection
      
    } catch (error) {
      // Ignore errors in relationship detection
    }

    return relationships;
  }

  private initializeBehavior(): ProcessBehavior {
    return {
      normalPatterns: {
        cpuUsage: { min: 0, max: 0, average: 0 },
        memoryUsage: { min: 0, max: 0, average: 0 },
        fileOperations: { min: 0, max: 0, average: 0 },
        networkActivity: { min: 0, max: 0, average: 0 }
      },
      anomalies: [],
      learningPeriod: true
    };
  }

  private analyzeProcessBehavior(): void {
    for (const [pid, context] of this.processes) {
      if (context.behavior.learningPeriod) {
        this.updateLearningPeriod(context);
      } else {
        this.updateNormalPatterns(context);
      }
    }
  }

  private updateLearningPeriod(context: ProcessContext): void {
    const elapsed = Date.now() - context.startTime.getTime();
    if (elapsed >= this.learningPeriod) {
      context.behavior.learningPeriod = false;
    }
    
    // Update normal patterns during learning
    this.updateNormalPatterns(context);
  }

  private updateNormalPatterns(context: ProcessContext): void {
    const { metrics, behavior } = context;
    const patterns = behavior.normalPatterns;

    // Update CPU usage patterns
    patterns.cpuUsage.min = Math.min(patterns.cpuUsage.min, metrics.cpu);
    patterns.cpuUsage.max = Math.max(patterns.cpuUsage.max, metrics.cpu);
    patterns.cpuUsage.average = (patterns.cpuUsage.average + metrics.cpu) / 2;

    // Update memory usage patterns
    patterns.memoryUsage.min = Math.min(patterns.memoryUsage.min, metrics.memory);
    patterns.memoryUsage.max = Math.max(patterns.memoryUsage.max, metrics.memory);
    patterns.memoryUsage.average = (patterns.memoryUsage.average + metrics.memory) / 2;

    // Similar updates for file and network patterns
  }

  private detectAnomalies(): void {
    for (const [pid, context] of this.processes) {
      if (context.behavior.learningPeriod) continue;

      const { metrics, behavior } = context;
      const patterns = behavior.normalPatterns;

      // Check for CPU anomalies
      if (metrics.cpu > patterns.cpuUsage.max * 1.5) {
        this.addAnomaly(context, {
          type: 'cpu',
          severity: 'high',
          description: 'Unusual CPU usage detected',
          timestamp: new Date(),
          metrics: { cpu: metrics.cpu }
        });
      }

      // Check for memory anomalies
      if (metrics.memory > patterns.memoryUsage.max * 1.5) {
        this.addAnomaly(context, {
          type: 'memory',
          severity: 'high',
          description: 'Unusual memory usage detected',
          timestamp: new Date(),
          metrics: { memory: metrics.memory }
        });
      }

      // Similar checks for file and network anomalies
    }
  }

  private addAnomaly(context: ProcessContext, anomaly: ProcessAnomaly): void {
    context.behavior.anomalies.push(anomaly);
    // Implement anomaly notification system here
  }

  // Helper methods for parsing process information
  private parseProcessList(output: string): Array<Pick<ProcessContext, 'pid' | 'name' | 'command' | 'user'>> {
    // Implementation depends on OS
    return [];
  }

  private parseCpuUsage(output: string): number {
    // Implementation depends on OS
    return 0;
  }

  private parseMemoryUsage(output: string): number {
    // Implementation depends on OS
    return 0;
  }

  private parseThreadCount(output: string): number {
    // Implementation depends on OS
    return 0;
  }

  private parseFileCount(output: string): number {
    // Implementation depends on OS
    return 0;
  }

  private parseNetworkConnections(output: string): number {
    // Implementation depends on OS
    return 0;
  }

  // Public methods for querying process intelligence
  async getProcessContext(pid: number): Promise<ProcessContext | null> {
    return this.processes.get(pid) || null;
  }

  async getProcessAnomalies(pid: number): Promise<ProcessAnomaly[]> {
    const context = await this.getProcessContext(pid);
    return context ? context.behavior.anomalies : [];
  }

  async getProcessRelationships(pid: number): Promise<ProcessRelationship[]> {
    const context = await this.getProcessContext(pid);
    return context ? context.relationships : [];
  }
}