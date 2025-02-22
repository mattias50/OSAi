import chokidar from 'chokidar';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { 
  FileMetadata, 
  MonitorConfig, 
  Alert, 
  AlertType,
  FileRelationship,
  UsagePattern,
  PerformanceMetrics,
  SecurityProfile,
  RelationshipType
} from '../types/index.js';

export class FileIntelligence {
  private watcher: chokidar.FSWatcher;
  private fileMetadata: Map<string, FileMetadata>;
  private config: MonitorConfig;
  private alertHandlers: ((alert: Alert) => void)[] = [];

  constructor(config: MonitorConfig) {
    this.config = config;
    this.fileMetadata = new Map();
    this.watcher = chokidar.watch(config.watchPaths, {
      ignored: config.excludePaths,
      persistent: true,
      ignoreInitial: false
    });

    this.setupWatcher();
  }

  private setupWatcher(): void {
    this.watcher
      .on('add', async (filePath: string) => this.handleFileAdd(filePath))
      .on('change', async (filePath: string) => this.handleFileChange(filePath))
      .on('unlink', async (filePath: string) => this.handleFileDelete(filePath));
  }

  private async handleFileAdd(filePath: string): Promise<void> {
    try {
      const metadata = await this.generateFileMetadata(filePath);
      this.fileMetadata.set(filePath, metadata);
      await this.analyzeFileRelationships(filePath);
      this.emitAlert({
        id: crypto.randomUUID(),
        type: AlertType.USAGE,
        severity: 'info',
        message: `New file detected: ${filePath}`,
        context: 'File monitoring system',
        timestamp: new Date(),
        relatedFiles: [filePath],
        suggestedActions: ['Review file purpose', 'Verify security profile'],
        status: 'new'
      });
    } catch (error) {
      this.handleError('File addition error', error, filePath);
    }
  }

  private async handleFileChange(filePath: string): Promise<void> {
    try {
      const oldMetadata = this.fileMetadata.get(filePath);
      const newMetadata = await this.generateFileMetadata(filePath);
      
      this.fileMetadata.set(filePath, newMetadata);
      await this.analyzeChanges(oldMetadata, newMetadata);
      await this.updateRelationships(filePath);
    } catch (error) {
      this.handleError('File change error', error, filePath);
    }
  }

  private async handleFileDelete(filePath: string): Promise<void> {
    try {
      const metadata = this.fileMetadata.get(filePath);
      if (metadata) {
        await this.handleDeletedRelationships(metadata);
        this.fileMetadata.delete(filePath);
        this.emitAlert({
          id: crypto.randomUUID(),
          type: AlertType.RELATIONSHIP,
          severity: 'warning',
          message: `File deleted: ${filePath}`,
          context: 'File monitoring system',
          timestamp: new Date(),
          relatedFiles: this.findRelatedFiles(filePath),
          suggestedActions: ['Update dependent files', 'Review system integrity'],
          status: 'new'
        });
      }
    } catch (error) {
      this.handleError('File deletion error', error, filePath);
    }
  }

  private async generateFileMetadata(filePath: string): Promise<FileMetadata> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    return {
      path: filePath,
      lastModified: stats.mtime,
      size: stats.size,
      hash,
      relationships: [],
      usagePatterns: [],
      performanceMetrics: this.initializePerformanceMetrics(),
      securityProfile: await this.generateSecurityProfile(filePath),
      contextualData: new Map()
    };
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      averageAccessTime: 0,
      averageReadTime: 0,
      averageWriteTime: 0,
      loadImpact: 0,
      memoryUsage: 0,
      optimizationScore: 1,
      lastAnalyzed: new Date()
    };
  }

  private async generateSecurityProfile(filePath: string): Promise<SecurityProfile> {
    const stats = await fs.stat(filePath);
    return {
      permissions: stats.mode.toString(8),
      owner: stats.uid.toString(),
      group: stats.gid.toString(),
      lastSecurityScan: new Date(),
      vulnerabilities: [],
      trustScore: 1,
      encryptionStatus: {
        isEncrypted: false
      }
    };
  }

  private async analyzeFileRelationships(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const relationships: FileRelationship[] = [];

    // Analyze imports and references
    const importPattern = /(?:import|require|from)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      const targetPath = this.resolveImportPath(match[1], filePath);
      if (targetPath) {
        relationships.push({
          type: RelationshipType.IMPORTS,
          targetPath,
          strength: 1,
          lastVerified: new Date()
        });
      }
    }

    // Update metadata with new relationships
    const metadata = this.fileMetadata.get(filePath);
    if (metadata) {
      metadata.relationships = relationships;
      this.fileMetadata.set(filePath, metadata);
    }
  }

  private resolveImportPath(importPath: string, currentFile: string): string {
    try {
      if (importPath.startsWith('.')) {
        return path.resolve(path.dirname(currentFile), importPath);
      }
      return importPath;
    } catch {
      return importPath;
    }
  }

  private async analyzeChanges(oldMetadata: FileMetadata | undefined, newMetadata: FileMetadata): Promise<void> {
    if (!oldMetadata) return;

    // Check for significant changes
    if (this.hasSignificantChanges(oldMetadata, newMetadata)) {
      this.emitAlert({
        id: crypto.randomUUID(),
        type: AlertType.ANOMALY,
        severity: 'warning',
        message: `Significant changes detected in ${newMetadata.path}`,
        context: 'File change analysis',
        timestamp: new Date(),
        relatedFiles: [newMetadata.path],
        suggestedActions: ['Review changes', 'Verify file integrity'],
        status: 'new'
      });
    }
  }

  private hasSignificantChanges(oldMetadata: FileMetadata, newMetadata: FileMetadata): boolean {
    // Size change threshold (30%)
    const sizeChange = Math.abs(newMetadata.size - oldMetadata.size) / oldMetadata.size;
    if (sizeChange > 0.3) return true;

    // Hash change indicates content change
    if (oldMetadata.hash !== newMetadata.hash) return true;

    return false;
  }

  private async updateRelationships(filePath: string): Promise<void> {
    await this.analyzeFileRelationships(filePath);
    
    // Update reverse relationships
    for (const [path, metadata] of this.fileMetadata.entries()) {
      if (metadata.relationships.some(rel => rel.targetPath === filePath)) {
        await this.analyzeFileRelationships(path);
      }
    }
  }

  private async handleDeletedRelationships(metadata: FileMetadata): Promise<void> {
    // Update all files that had relationships with the deleted file
    for (const [path, fileMetadata] of this.fileMetadata.entries()) {
      if (fileMetadata.relationships.some(rel => rel.targetPath === metadata.path)) {
        fileMetadata.relationships = fileMetadata.relationships.filter(
          rel => rel.targetPath !== metadata.path
        );
        this.fileMetadata.set(path, fileMetadata);
      }
    }
  }

  private findRelatedFiles(filePath: string): string[] {
    const related = new Set<string>();
    
    for (const [path, metadata] of this.fileMetadata.entries()) {
      if (metadata.relationships.some(rel => rel.targetPath === filePath)) {
        related.add(path);
      }
    }

    return Array.from(related);
  }

  private handleError(context: string, error: unknown, filePath: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.emitAlert({
      id: crypto.randomUUID(),
      type: AlertType.ANOMALY,
      severity: 'error',
      message: `${context}: ${errorMessage}`,
      context: 'Error handling',
      timestamp: new Date(),
      relatedFiles: [filePath],
      suggestedActions: ['Investigate error cause', 'Check file permissions'],
      status: 'new'
    });
  }

  public onAlert(handler: (alert: Alert) => void): void {
    this.alertHandlers.push(handler);
  }

  private emitAlert(alert: Alert): void {
    this.alertHandlers.forEach(handler => handler(alert));
  }

  public async stop(): Promise<void> {
    await this.watcher.close();
  }
}