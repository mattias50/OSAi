# OSAi Test Scenarios

## Basic Test Setup

1. Create a simple Flask application:
```python
# test_app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return 'Test App'

if __name__ == '__main__':
    app.run()
```

## Test Scenarios

### 1. File Monitoring Test
```bash
# Start monitoring
osai-monitor "watch test_app.py"

# Expected Results:
- Should detect file creation
- Should track modifications
- Should understand file purpose
- Should identify dependencies
```

### 2. Process Intelligence Test
```bash
# Run the Flask app
python test_app.py

# In another terminal
osai-process "analyze what test_app.py is doing"

# Expected Results:
- Should identify it's a Flask server
- Should show port usage
- Should track resource consumption
- Should detect any issues
```

### 3. Self-Healing Test
```python
# Introduce a common error
@app.route('/error')
def error():
    return undefined_variable  # This will cause an error

# Expected Results:
- Should detect the error
- Should suggest the fix
- Should explain the issue
- Should prevent similar errors
```

### 4. Natural Language Test
```bash
# Try various commands:
osai-monitor "explain what's running on port 5000"
osai-monitor "check if test_app.py has any problems"
osai-monitor "optimize the flask app"

# Expected Results:
- Should understand natural language
- Should provide relevant responses
- Should take appropriate actions
- Should explain what it's doing
```

## Validation Steps

1. Basic Functionality
- [ ] File monitoring works
- [ ] Process tracking works
- [ ] Natural language commands work
- [ ] Self-healing features work

2. Intelligence Features
- [ ] Understands file context
- [ ] Detects process relationships
- [ ] Provides meaningful insights
- [ ] Makes smart suggestions

3. Error Handling
- [ ] Handles invalid commands gracefully
- [ ] Recovers from errors
- [ ] Provides clear error messages
- [ ] Suggests solutions

4. Performance
- [ ] Minimal resource usage
- [ ] Quick response times
- [ ] Efficient monitoring
- [ ] No memory leaks

## How to Run Tests

1. Set up test environment:
```bash
# Install dependencies
npm install
pip install flask

# Build OSAi
npm run build
```

2. Run automated tests:
```bash
npm test
```

3. Manual Testing:
```bash
# Start the test app
python test_app.py

# In another terminal
osai-monitor "watch and explain test_app.py"
```

## What Success Looks Like

1. File Intelligence
```
OSAi: "test_app.py is a Flask web application:
- Serves on port 5000
- Has one route: '/'
- No security issues detected
- Performance is optimal"
```

2. Process Monitoring
```
OSAi: "Flask process (PID 1234):
- Normal resource usage
- No memory leaks
- Expected network activity
- No anomalies detected"
```

3. Error Detection
```
OSAi: "Error detected in /error route:
- Undefined variable 'undefined_variable'
- Suggestion: Define the variable or remove the route
- Similar errors prevented in other routes"
```

4. Natural Language Understanding
```
OSAi: "Understanding command 'optimize the flask app':
- Analyzing current configuration
- Checking for optimization opportunities
- Implementing performance improvements
- Monitoring results"
```

## Safety Checks

1. System Safety
- [ ] No unauthorized system changes
- [ ] Safe file operations only
- [ ] Protected system resources
- [ ] Controlled process management

2. Data Safety
- [ ] No sensitive data exposure
- [ ] Secure file handling
- [ ] Protected configurations
- [ ] Safe logging practices

3. Operation Safety
- [ ] Reversible changes
- [ ] Backup capabilities
- [ ] Safe defaults
- [ ] Failure recovery

## Test Results Documentation

For each test:
1. Record initial state
2. Document actions taken
3. Note system responses
4. Verify expected outcomes
5. Document any issues
6. Track performance metrics

This testing framework helps ensure OSAi works correctly and safely while demonstrating its capabilities.