# OSAi Test Application

This test suite demonstrates and validates OSAi's core capabilities through a practical Flask application.

## What This Tests

1. **File Intelligence**
   - File creation/modification tracking
   - Content understanding
   - Dependency analysis
   - Operation monitoring

2. **Process Intelligence**
   - Resource usage tracking
   - Behavior analysis
   - Performance monitoring
   - Anomaly detection

3. **Error Handling**
   - Error detection
   - Problem diagnosis
   - Solution suggestions
   - Self-healing capabilities

4. **Natural Language**
   - Command interpretation
   - Context understanding
   - Intelligent responses
   - Action execution

## Test Components

### 1. Flask Application (`app.py`)
A test application with endpoints that trigger different scenarios:
- `/` - Basic status check
- `/cpu-intensive` - CPU usage monitoring
- `/memory-leak` - Memory usage tracking
- `/file-operations` - File system monitoring
- `/error` - Error handling
- `/dependencies` - Dependency analysis
- `/process-info` - Process monitoring

### 2. Test Script (`test_monitoring.py`)
Automated tests that verify OSAi's functionality:
- Basic monitoring validation
- CPU monitoring tests
- Memory tracking tests
- File operation monitoring
- Error handling verification

## Running the Tests

### Quick Start
```bash
# Make the script executable
chmod +x run_tests.sh

# Run the test suite
./run_tests.sh
```

### Manual Setup
1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install OSAi:
```bash
cd ../../
npm install
npm run build
cd tests/test_app
```

4. Run tests:
```bash
python test_monitoring.py
```

## Expected Output

When everything works correctly, you should see:

```
🎯 Starting OSAi monitoring tests...

🚀 Starting test application...
🔍 Starting OSAi monitor...

🧪 Running tests...
📊 Testing basic monitoring...
  ✓ Basic monitoring working

💻 Testing CPU monitoring...
  ✓ CPU monitoring working

🧠 Testing memory monitoring...
  ✓ Memory monitoring working

📁 Testing file operations monitoring...
  ✓ File operations monitoring working

🐛 Testing error handling...
  ✓ Error handling working

✅ All tests completed successfully!

🧹 Cleaning up...
  ✓ Cleanup completed

🎉 All tests completed successfully!
```

## Troubleshooting

### Common Issues

1. Port Already in Use
```
Error: Port 5000 already in use
Solution: Kill any process using port 5000 or modify the port in app.py
```

2. Dependencies Missing
```
Error: Module not found
Solution: Ensure all dependencies are installed with pip install -r requirements.txt
```

3. OSAi Not Built
```
Error: OSAi commands not found
Solution: Run npm install && npm run build in the root directory
```

### Getting Help

If you encounter issues:
1. Check the logs in `osai-monitor.log`
2. Verify all dependencies are installed
3. Ensure OSAi is built correctly
4. Open an issue on GitHub with test output

## Extending the Tests

To add new test scenarios:

1. Add new routes to `app.py`:
```python
@app.route('/new-test')
def new_test():
    # Test implementation
    return jsonify({'result': 'test'})
```

2. Add test cases to `test_monitoring.py`:
```python
def _test_new_feature(self):
    """Test new feature"""
    print("\n🧪 Testing new feature...")
    response = requests.get(f"{self.base_url}/new-test")
    assert response.status_code == 200
    print("  ✓ New feature working")
```

## Contributing

When adding new tests:
1. Follow the existing pattern
2. Add clear documentation
3. Include expected outputs
4. Update this README
5. Test thoroughly before submitting

This test suite helps ensure OSAi works correctly and demonstrates its capabilities to new users.