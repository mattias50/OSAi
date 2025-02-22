# OSAi Monitor

An AI-native system monitoring tool that understands natural language commands and provides intelligent monitoring of files, scripts, and processes.

## Features

- **Natural Language Commands**: Interact with your system using plain English
- **Intelligent Script Monitoring**: Track all file operations during script execution
- **Process Intelligence**: Monitor and analyze process behavior with AI-driven insights
- **Deep File System Intelligence**: Understand file relationships and patterns
- **Rich Execution Reports**: Get detailed insights about system operations

## Installation

```bash
npm install -g osai-monitor
```

## Usage

### Process Monitoring

Monitor and analyze processes using natural language:

```bash
osai-process "monitor process 1234"
osai-process "analyze behavior of process 5678"
osai-process "explain what process 1234 is doing"
osai-process "check relationships for process 5678"
```

The process monitor provides:
- Real-time process metrics
- Behavioral pattern analysis
- Anomaly detection
- Process relationship mapping
- Natural language explanations of process activity

### Script Monitoring

Monitor a Python script's execution and track all file operations:

```bash
osai-script-monitor "monitor script app.py"
# or use natural language
osai-script-monitor "check and monitor files when running app.py"
```

### System Monitoring

Monitor system operations with natural language commands:

```bash
osai-monitor "start flask app on port 8080"
osai-monitor "check what's running on port 3000"
osai-monitor "stop server on port 8080"
```

## Example Commands

The system understands various natural language commands:

### Process Commands
- "monitor process 1234"
- "analyze behavior of process 5678"
- "explain what process 1234 is doing"
- "check relationships for process 5678"
- "show anomalies for process 1234"
- "track resource usage of process 5678"

### Script Monitoring
- "monitor python script app.py"
- "track file operations when running test.py"
- "watch and log all files used by main.py"
- "analyze script dependencies in app.py"

### System Operations
- "start flask server on port 5000"
- "check what's using port 8080"
- "stop all servers on port 3000"
- "monitor directory for changes"

## Process Intelligence

The process monitoring system provides deep insights into process behavior:

### Metrics Tracked
- CPU usage patterns
- Memory utilization
- Thread count
- Open file handles
- Network connections
- Process relationships
- Behavioral anomalies

### Behavioral Analysis
The system learns normal behavior patterns for each process and can:
- Detect unusual resource usage
- Identify abnormal process relationships
- Alert on unexpected behavior changes
- Provide natural language explanations of process activity

### Process Relationships
Understand how processes interact:
- Parent-child relationships
- Inter-process communication
- Resource sharing patterns
- System service dependencies

## Execution Reports

The system generates detailed reports for both script execution and process monitoring:

### Script Execution Reports
```json
{
  "script": "/path/to/app.py",
  "execution": {
    "startTime": "2025-02-22T14:30:00.000Z",
    "endTime": "2025-02-22T14:30:05.000Z",
    "duration": 5,
    "exitCode": 0
  },
  "dependencies": ["numpy", "pandas", "requests"],
  "fileOperations": [
    {
      "type": "read",
      "path": "data.csv",
      "timestamp": "2025-02-22T14:30:01.000Z"
    }
  ]
}
```

### Process Analysis Reports
```json
{
  "process": {
    "pid": 1234,
    "name": "python",
    "command": "python app.py"
  },
  "behavior": {
    "cpuUsage": {
      "min": 0.1,
      "max": 15.2,
      "average": 5.4
    },
    "memoryUsage": {
      "min": 50,
      "max": 200,
      "average": 125
    }
  },
  "anomalies": [
    {
      "type": "cpu",
      "severity": "high",
      "description": "Unusual CPU spike detected",
      "timestamp": "2025-02-22T14:35:00.000Z"
    }
  ]
}
```

## How It Works

OSAi Monitor uses advanced natural language processing to understand your commands and translate them into system operations. It maintains an intelligent understanding of your system, tracking:

- File relationships and dependencies
- Process behavior patterns
- System resource usage
- Inter-process relationships
- Performance metrics
- Security profiles
- Contextual metadata

This intelligence allows it to provide deep insights into how your system operates and behaves.

## Requirements

- Node.js >= 18.0.0
- Python (for monitoring Python scripts)
- OpenAI API key (for natural language processing)

## Environment Variables

```bash
# Required for natural language processing
export OPENAI_API_KEY=your_api_key_here
```

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT

---

This is part of the larger OSAi (Operating System AI) vision, demonstrating how natural language and AI-native components can transform system operations and monitoring.