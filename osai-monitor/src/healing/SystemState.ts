import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { configManager } from '../config/index.js';

const execAsync = promisify(exec);

export interface SystemMetrics {
  cpu: {
    usage: number;
    temperature?: number;
    frequency: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    swapUsed: number;
    swapTotal: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    readRate: number;
    writeRate: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connectionsCount: number;
    errorRate: number;
  };
  processes: {
    total: number;
    running: number;
    blocked: number;
    sleeping: number;
  };
}

export interface ComponentState {
  name: string;
  type: 'process' | 'service' | 'file' | 'network';
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  metrics: Record<string, number>;
  dependencies: string[];
  lastUpdate: Date;
  history: Array<{
    timestamp: Date;
    metrics: Record<string, number>;
    status: string;
  }>;
}

export class SystemStateMonitor {
  private metrics: SystemMetrics;
  private components: Map<string, ComponentState> = new Map();
  private updateInterval: number;
  private lastUpdate: Date;

  constructor() {
    this.updateInterval = configManager.getSystemSettings().monitorInterval;
    this.metrics = this.initializeMetrics();
    this.lastUpdate = new Date();
    this.startMonitoring();
  }

  private initializeMetrics(): SystemMetrics {
    return {
      cpu: {
        usage: 0,
        frequency: 0,
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        used: 0,
        free: 0,
        swapUsed: 0,
        swapTotal: 0
      },
      disk: {
        total: 0,
        used: 0,
        free: 0,
        readRate: 0,
        writeRate: 0
      },
      network: {
        bytesIn: 0,
        bytesOut: 0,
        connectionsCount: 0,
        errorRate: 0
      },
      processes: {
        total: 0,
        running: 0,
        blocked: 0,
        sleeping: 0
      }
    };
  }

  private async startMonitoring(): Promise<void> {
    setInterval(async () => {
      await this.updateMetrics();
      await this.updateComponents();
      this.lastUpdate = new Date();
    }, this.updateInterval);
  }

  private async updateMetrics(): Promise<void> {
    try {
      // Update CPU metrics
      const cpuUsage = os.loadavg()[0] / os.cpus().length;
      this.metrics.cpu.usage = cpuUsage * 100;
      this.metrics.cpu.frequency = os.cpus()[0].speed;

      // Update memory metrics
      const freemem = os.freemem();
      this.metrics.memory.used = this.metrics.memory.total - freemem;
      this.metrics.memory.free = freemem;

      // Update process metrics
      const { stdout: psOutput } = await execAsync('ps aux | wc -l');
      this.metrics.processes.total = parseInt(psOutput.trim()) - 1;

      // Update disk metrics
      if (process.platform !== 'win32') {
        const { stdout: dfOutput } = await execAsync('df -k /');
        const [, total, used, free] = dfOutput.split('\n')[1].split(/\s+/);
        this.metrics.disk.total = parseInt(total) * 1024;
        this.metrics.disk.used = parseInt(used) * 1024;
        this.metrics.disk.free = parseInt(free) * 1024;
      }

      // Update network metrics
      if (process.platform !== 'win32') {
        const { stdout: netstatOutput } = await execAsync('netstat -an | wc -l');
        this.metrics.network.connectionsCount = parseInt(netstatOutput.trim());
      }
    } catch (error) {
      console.error('Error updating system metrics:', error);
    }
  }

  private async updateComponents(): Promise<void> {
    for (const [name, component] of this.components) {
      try {
        await this.updateComponentState(component);
      } catch (error) {
        console.error(`Error updating component ${name}:`, error);
      }
    }
  }

  private async updateComponentState(component: ComponentState): Promise<void> {
    const currentMetrics = await this.getComponentMetrics(component);
    const currentStatus = await this.evaluateComponentHealth(component, currentMetrics);

    // Update component state
    component.metrics = currentMetrics;
    component.status = currentStatus;
    component.lastUpdate = new Date();

    // Update history
    component.history.push({
      timestamp: new Date(),
      metrics: currentMetrics,
      status: currentStatus
    });

    // Trim history if too long
    if (component.history.length > 100) {
      component.history = component.history.slice(-100);
    }
  }

  private async getComponentMetrics(component: ComponentState): Promise<Record<string, number>> {
    switch (component.type) {
      case 'process':
        return this.getProcessMetrics(component.name);
      case 'service':
        return this.getServiceMetrics(component.name);
      case 'file':
        return this.getFileMetrics(component.name);
      case 'network':
        return this.getNetworkMetrics(component.name);
      default:
        return {};
    }
  }

  private async evaluateComponentHealth(
    component: ComponentState,
    currentMetrics: Record<string, number>
  ): Promise<ComponentState['status']> {
    // Use AI to evaluate component health
    const analysis = await configManager.getAIEngine().analyze(`
      Component: ${component.name}
      Type: ${component.type}
      Current Metrics: ${JSON.stringify(currentMetrics)}
      Historical Data: ${JSON.stringify(component.history.slice(-5))}

      Evaluate the component's health status based on:
      1. Current metrics vs historical patterns
      2. Dependency health
      3. Resource usage
      4. Error rates

      Return one of: "healthy", "degraded", "critical", "unknown"
    `);

    return analysis.trim() as ComponentState['status'];
  }

  // Metric collection methods for different component types
  private async getProcessMetrics(processName: string): Promise<Record<string, number>> {
    try {
      const { stdout } = await execAsync(`ps aux | grep ${processName}`);
      const [, , cpu, mem] = stdout.split('\n')[0].split(/\s+/);
      return {
        cpu_usage: parseFloat(cpu),
        memory_usage: parseFloat(mem)
      };
    } catch {
      return { cpu_usage: 0, memory_usage: 0 };
    }
  }

  private async getServiceMetrics(serviceName: string): Promise<Record<string, number>> {
    // Implement service-specific metrics collection
    return {};
  }

  private async getFileMetrics(filePath: string): Promise<Record<string, number>> {
    // Implement file-specific metrics collection
    return {};
  }

  private async getNetworkMetrics(interfaceName: string): Promise<Record<string, number>> {
    // Implement network-specific metrics collection
    return {};
  }

  // Public API
  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public getComponentState(name: string): ComponentState | undefined {
    return this.components.get(name);
  }

  public async registerComponent(component: Omit<ComponentState, 'history' | 'lastUpdate'>): Promise<void> {
    this.components.set(component.name, {
      ...component,
      history: [],
      lastUpdate: new Date()
    });
  }

  public removeComponent(name: string): void {
    this.components.delete(name);
  }
}