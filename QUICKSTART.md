# OSAi Quick Start Guide

Get started with AI-native development in 5 minutes.

## Installation

```bash
# Install OSAi monitor
npm install -g osai-monitor

# For Python development
pip install osai-python
```

## Basic Usage

### 1. Monitor Any Python Script

```bash
# Start monitoring with natural language
osai-monitor "watch and explain what my-script.py does"

# Monitor with automatic optimization
osai-monitor "optimize and run my-script.py"
```

### 2. Flask Development

```python
# app.py
from flask import Flask
from osai.flask import monitor

app = Flask(__name__)
monitor(app)  # That's it! OSAi now manages your app

@app.route('/')
def home():
    return 'Hello World'

if __name__ == '__main__':
    app.run()
```

Run it:
```bash
osai-monitor "run and optimize flask app"
```

OSAi will:
- Monitor performance
- Suggest improvements
- Fix issues automatically
- Optimize for your environment

### 3. Process Monitoring

```bash
# Monitor specific process
osai-process "explain what process 1234 is doing"

# Monitor application behavior
osai-process "analyze behavior of my-app"
```

### 4. System Intelligence

```bash
# Get system insights
osai-monitor "explain system performance"

# Optimize running applications
osai-monitor "optimize all running services"
```

## Common Commands

### Development
```bash
# Start development with assistance
osai-monitor "help me develop my flask app"

# Debug issues
osai-monitor "find and fix problems in my app"

# Optimize performance
osai-monitor "make my app faster"
```

### Monitoring
```bash
# Watch for issues
osai-monitor "alert me about problems"

# Track resource usage
osai-monitor "watch system resources"

# Monitor specific components
osai-monitor "watch database performance"
```

### System Management
```bash
# Manage processes
osai-process "optimize running processes"

# Handle services
osai-monitor "manage system services"

# Resource optimization
osai-monitor "balance system resources"
```

## What's Next?

1. Try the example applications in `example-apps.md`
2. Integrate OSAi into your existing projects
3. Explore advanced features in the documentation
4. Join our community and contribute

## Getting Help

- Use natural language: "osai-monitor help me with..."
- Check documentation: https://osai.dev/docs
- Join Discord: https://discord.gg/osai
- GitHub issues: https://github.com/osai/osai-monitor/issues

## Pro Tips

1. Let OSAi Learn
   - The more you use it, the smarter it gets
   - It learns your development patterns
   - Adapts to your environment

2. Use Natural Language
   - Be specific about what you want
   - OSAi understands context
   - Ask for explanations

3. Trust But Verify
   - OSAi suggests smart changes
   - Review before applying
   - Learn from its decisions

Start with these basics and gradually explore more advanced features as you get comfortable with AI-native development.