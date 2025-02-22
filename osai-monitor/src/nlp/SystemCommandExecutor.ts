import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

export class SystemCommandExecutor {
  private isWindows: boolean;

  constructor() {
    this.isWindows = platform() === 'win32';
  }

  async startFlaskApp(port: string, host: string): Promise<string> {
    try {
      // Check if Flask is installed
      await this.checkFlaskInstallation();

      // Find Python executable
      const pythonCmd = this.isWindows ? 'python' : 'python3';

      // Create a simple Flask app if it doesn't exist
      await this.ensureFlaskApp();

      // Start Flask app with specified port and host
      const command = `${pythonCmd} -c "from flask import Flask; app = Flask(__name__); @app.route('/'); def home(): return 'OSAi Flask Server Running'; app.run(host='${host}', port=${port})"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        throw new Error(stderr);
      }

      return `Flask server started successfully on http://${host}:${port}`;
    } catch (error) {
      throw new Error(`Failed to start Flask app: ${error.message}`);
    }
  }

  async startNodeServer(port: string): Promise<string> {
    try {
      // Create a simple Express server if it doesn't exist
      await this.ensureNodeServer();

      const command = `node -e "const express=require('express');const app=express();app.get('/',(req,res)=>res.send('OSAi Node Server Running'));app.listen(${port},()=>console.log('Server running on port ${port}'))"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        throw new Error(stderr);
      }

      return `Node server started successfully on port ${port}`;
    } catch (error) {
      throw new Error(`Failed to start Node server: ${error.message}`);
    }
  }

  async stopServerOnPort(port: string): Promise<string> {
    try {
      let command: string;
      if (this.isWindows) {
        command = `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /F /PID %a`;
      } else {
        command = `lsof -ti:${port} | xargs kill -9`;
      }

      await execAsync(command);
      return `Successfully stopped server on port ${port}`;
    } catch (error) {
      throw new Error(`Failed to stop server: ${error.message}`);
    }
  }

  async stopService(serviceName: string): Promise<string> {
    try {
      let command: string;
      if (this.isWindows) {
        command = `net stop ${serviceName}`;
      } else {
        command = `sudo service ${serviceName} stop`;
      }

      const { stdout, stderr } = await execAsync(command);
      return `Successfully stopped service ${serviceName}`;
    } catch (error) {
      throw new Error(`Failed to stop service: ${error.message}`);
    }
  }

  async configurePort(port: string, service: string): Promise<string> {
    // This would need to be implemented based on specific service requirements
    throw new Error('Port configuration not implemented for this service');
  }

  async configureEnvironment(env: Record<string, string>): Promise<string> {
    try {
      for (const [key, value] of Object.entries(env)) {
        const command = this.isWindows
          ? `setx ${key} "${value}"`
          : `export ${key}="${value}"`;
        
        await execAsync(command);
      }

      return 'Environment variables configured successfully';
    } catch (error) {
      throw new Error(`Failed to configure environment: ${error.message}`);
    }
  }

  async checkServerStatus(port: string): Promise<string> {
    try {
      let command: string;
      if (this.isWindows) {
        command = `netstat -ano | findstr :${port}`;
      } else {
        command = `lsof -i:${port}`;
      }

      const { stdout } = await execAsync(command);
      return stdout ? `Server is running on port ${port}` : `No server found on port ${port}`;
    } catch (error) {
      return `No server found on port ${port}`;
    }
  }

  async checkServiceStatus(serviceName: string): Promise<string> {
    try {
      let command: string;
      if (this.isWindows) {
        command = `sc query ${serviceName}`;
      } else {
        command = `systemctl status ${serviceName}`;
      }

      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to check service status: ${error.message}`);
    }
  }

  private async checkFlaskInstallation(): Promise<void> {
    try {
      await execAsync(`${this.isWindows ? 'pip' : 'pip3'} show flask`);
    } catch {
      throw new Error('Flask is not installed. Please install it using: pip install flask');
    }
  }

  private async ensureFlaskApp(): Promise<void> {
    // Implementation would create a basic Flask app if needed
    // This is a simplified version for demonstration
  }

  private async ensureNodeServer(): Promise<void> {
    try {
      await execAsync('npm list express');
    } catch {
      await execAsync('npm install express');
    }
  }
}