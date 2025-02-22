import { exec } from 'child_process';
import { promisify } from 'util';
import { configManager } from '../config/index.js';
import { SystemStateMonitor } from './SystemState.js';

const execAsync = promisify(exec);

interface ActionContext {
  component: string;
  action: string;
  parameters: Record<string, any>;
  systemState: any;
  safetyChecks: string[];
  validation: string[];
  rollback: string[];
}

interface ActionResult {
  success: boolean;
  message: string;
  changes: string[];
  metrics?: Record<string, number>;
}

export class HealingActions {
  private stateMonitor: SystemStateMonitor;
  private actionHistory: Map<string, ActionResult[]> = new Map();
  private activeActions: Set<string> = new Set();

  constructor() {
    this.stateMonitor = new SystemStateMonitor();
  }

  async executeAction(context: ActionContext): Promise<ActionResult> {
    if (!this.validateAction(context)) {
      return {
        success: false,
        message: 'Action validation failed',
        changes: []
      };
    }

    const actionId = `${context.component}-${Date.now()}`;
    this.activeActions.add(actionId);

    try {
      // Perform safety checks
      await this.performSafetyChecks(context);

      // Take snapshot for rollback
      const snapshot = await this.takeSystemSnapshot(context);

      // Execute the action
      const result = await this.performAction(context);

      // Validate the changes
      const validation = await this.validateChanges(context);
      if (!validation.success) {
        await this.rollback(context, snapshot);
        return {
          success: false,
          message: `Validation failed: ${validation.message}`,
          changes: []
        };
      }

      // Record the action
      this.recordAction(actionId, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Action failed: ${errorMessage}`,
        changes: []
      };
    } finally {
      this.activeActions.delete(actionId);
    }
  }

  private async validateAction(context: ActionContext): Promise<boolean> {
    // Check if action is allowed
    if (!configManager.getSystemSettings().allowSystemModifications) {
      return false;
    }

    // Check if component exists
    const componentState = this.stateMonitor.getComponentState(context.component);
    if (!componentState) {
      return false;
    }

    // Check for conflicting actions
    if (this.hasConflictingActions(context)) {
      return false;
    }

    return true;
  }

  private hasConflictingActions(context: ActionContext): boolean {
    // Check if there are any active actions on the same component
    return Array.from(this.activeActions).some(actionId => 
      actionId.startsWith(context.component)
    );
  }

  private async performSafetyChecks(context: ActionContext): Promise<void> {
    for (const check of context.safetyChecks) {
      const result = await this.evaluateSafetyCheck(check, context);
      if (!result.success) {
        throw new Error(`Safety check failed: ${result.message}`);
      }
    }
  }

  private async evaluateSafetyCheck(
    check: string,
    context: ActionContext
  ): Promise<{ success: boolean; message: string }> {
    // Use AI to evaluate safety check
    const analysis = await configManager.getAIEngine().analyze(`
      Safety Check: ${check}
      Context: ${JSON.stringify(context)}
      Current System State: ${JSON.stringify(this.stateMonitor.getMetrics())}

      Evaluate if this action is safe to perform.
      Consider:
      1. System stability
      2. Data integrity
      3. Service availability
      4. Resource usage
      5. Security implications

      Format response as JSON:
      {
        "safe": boolean,
        "reason": string
      }
    `);

    const result = JSON.parse(analysis);
    return {
      success: result.safe,
      message: result.reason
    };
  }

  private async takeSystemSnapshot(context: ActionContext): Promise<any> {
    // Take snapshot of relevant system state
    return {
      metrics: this.stateMonitor.getMetrics(),
      componentState: this.stateMonitor.getComponentState(context.component),
      timestamp: new Date()
    };
  }

  private async performAction(context: ActionContext): Promise<ActionResult> {
    const { action, parameters } = context;

    switch (action) {
      case 'restart_service':
        return this.restartService(parameters.service);
      
      case 'adjust_resources':
        return this.adjustResources(parameters);
      
      case 'optimize_configuration':
        return this.optimizeConfiguration(parameters);
      
      case 'cleanup_resources':
        return this.cleanupResources(parameters);
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  private async validateChanges(context: ActionContext): Promise<{ success: boolean; message: string }> {
    for (const validation of context.validation) {
      const result = await this.evaluateValidation(validation, context);
      if (!result.success) {
        return result;
      }
    }

    return { success: true, message: 'All validations passed' };
  }

  private async evaluateValidation(
    validation: string,
    context: ActionContext
  ): Promise<{ success: boolean; message: string }> {
    // Use AI to evaluate validation criteria
    const analysis = await configManager.getAIEngine().analyze(`
      Validation: ${validation}
      Context: ${JSON.stringify(context)}
      Current System State: ${JSON.stringify(this.stateMonitor.getMetrics())}

      Evaluate if the changes meet the validation criteria.
      Consider:
      1. Expected outcomes
      2. Performance metrics
      3. System stability
      4. Service health

      Format response as JSON:
      {
        "valid": boolean,
        "reason": string
      }
    `);

    const result = JSON.parse(analysis);
    return {
      success: result.valid,
      message: result.reason
    };
  }

  private async rollback(context: ActionContext, snapshot: any): Promise<void> {
    for (const step of context.rollback) {
      try {
        await this.executeRollbackStep(step, snapshot);
      } catch (error) {
        console.error(`Rollback step failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private recordAction(actionId: string, result: ActionResult): void {
    const [component] = actionId.split('-');
    const history = this.actionHistory.get(component) || [];
    history.push(result);
    this.actionHistory.set(component, history);
  }

  // Specific action implementations
  private async restartService(service: string): Promise<ActionResult> {
    try {
      await execAsync(`systemctl restart ${service}`);
      return {
        success: true,
        message: `Service ${service} restarted successfully`,
        changes: [`Restarted service: ${service}`]
      };
    } catch (error) {
      throw new Error(`Failed to restart service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async adjustResources(params: Record<string, any>): Promise<ActionResult> {
    // Implement resource adjustment logic
    return {
      success: true,
      message: 'Resources adjusted successfully',
      changes: ['Resource adjustment applied']
    };
  }

  private async optimizeConfiguration(params: Record<string, any>): Promise<ActionResult> {
    // Implement configuration optimization logic
    return {
      success: true,
      message: 'Configuration optimized successfully',
      changes: ['Configuration changes applied']
    };
  }

  private async cleanupResources(params: Record<string, any>): Promise<ActionResult> {
    // Implement resource cleanup logic
    return {
      success: true,
      message: 'Resources cleaned up successfully',
      changes: ['Cleanup actions completed']
    };
  }

  private async executeRollbackStep(step: string, snapshot: any): Promise<void> {
    // Implement rollback step execution
  }
}