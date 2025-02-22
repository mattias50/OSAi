import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { SystemCommandExecutor } from './SystemCommandExecutor.js';

interface CommandIntent {
  action: string;
  target: string;
  parameters: Record<string, string>;
  confidence: number;
}

export class CommandInterpreter {
  private llm: ChatOpenAI;
  private executor: SystemCommandExecutor;
  
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
    });
    this.executor = new SystemCommandExecutor();
  }

  async interpretCommand(naturalCommand: string): Promise<CommandIntent> {
    const template = `
      Analyze the following natural language command and extract the system operation intent.
      Format the response as a JSON object with the following structure:
      {
        "action": "the primary action (e.g., start, stop, configure)",
        "target": "the target system component (e.g., server, port, service)",
        "parameters": {
          // key-value pairs of relevant parameters
        },
        "confidence": // confidence score between 0 and 1
      }

      Natural command: {command}

      Response (JSON only):
    `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['command'],
    });

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
    });

    const response = await chain.call({
      command: naturalCommand,
    });

    return JSON.parse(response.text);
  }

  async executeCommand(intent: CommandIntent): Promise<string> {
    // Validate confidence threshold
    if (intent.confidence < 0.8) {
      throw new Error('Command intent confidence too low. Please be more specific.');
    }

    // Map intents to system operations
    switch (intent.action.toLowerCase()) {
      case 'start':
        return this.handleStartCommand(intent);
      case 'stop':
        return this.handleStopCommand(intent);
      case 'configure':
        return this.handleConfigureCommand(intent);
      case 'status':
        return this.handleStatusCommand(intent);
      default:
        throw new Error(`Unsupported action: ${intent.action}`);
    }
  }

  private async handleStartCommand(intent: CommandIntent): Promise<string> {
    switch (intent.target.toLowerCase()) {
      case 'flask':
      case 'flask-server':
      case 'flask-app':
        const port = intent.parameters.port || '5000';
        const host = intent.parameters.host || '0.0.0.0';
        return this.executor.startFlaskApp(port, host);
      
      case 'node':
      case 'node-server':
        const nodePort = intent.parameters.port || '3000';
        return this.executor.startNodeServer(nodePort);
      
      default:
        throw new Error(`Unsupported target for start: ${intent.target}`);
    }
  }

  private async handleStopCommand(intent: CommandIntent): Promise<string> {
    switch (intent.target.toLowerCase()) {
      case 'server':
      case 'port':
        const port = intent.parameters.port;
        return this.executor.stopServerOnPort(port);
      
      case 'service':
        const service = intent.parameters.name;
        return this.executor.stopService(service);
      
      default:
        throw new Error(`Unsupported target for stop: ${intent.target}`);
    }
  }

  private async handleConfigureCommand(intent: CommandIntent): Promise<string> {
    switch (intent.target.toLowerCase()) {
      case 'port':
        const port = intent.parameters.port;
        const service = intent.parameters.service;
        return this.executor.configurePort(port, service);
      
      case 'environment':
      case 'env':
        return this.executor.configureEnvironment(intent.parameters);
      
      default:
        throw new Error(`Unsupported target for configure: ${intent.target}`);
    }
  }

  private async handleStatusCommand(intent: CommandIntent): Promise<string> {
    switch (intent.target.toLowerCase()) {
      case 'server':
      case 'port':
        const port = intent.parameters.port;
        return this.executor.checkServerStatus(port);
      
      case 'service':
        const service = intent.parameters.name;
        return this.executor.checkServiceStatus(service);
      
      default:
        throw new Error(`Unsupported target for status: ${intent.target}`);
    }
  }
}