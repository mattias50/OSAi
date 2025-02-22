from flask import Flask, jsonify
import time
import psutil
import os

app = Flask(__name__)

# Global variable to simulate a potential memory leak
growing_list = []

@app.route('/')
def home():
    """Simple home route to test basic functionality"""
    return jsonify({
        'status': 'running',
        'time': time.time(),
        'pid': os.getpid()
    })

@app.route('/cpu-intensive')
def cpu_intensive():
    """Route to test CPU monitoring"""
    result = 0
    for i in range(1000000):
        result += i
    return jsonify({
        'result': result,
        'cpu_percent': psutil.cpu_percent()
    })

@app.route('/memory-leak')
def memory_leak():
    """Route to test memory leak detection"""
    global growing_list
    growing_list.extend([i for i in range(1000000)])
    return jsonify({
        'memory_used': len(growing_list),
        'memory_percent': psutil.Process().memory_percent()
    })

@app.route('/file-operations')
def file_operations():
    """Route to test file operation monitoring"""
    # Create a temporary file
    with open('test.txt', 'w') as f:
        f.write('Test data')
    
    # Read the file
    with open('test.txt', 'r') as f:
        content = f.read()
    
    # Delete the file
    os.remove('test.txt')
    
    return jsonify({
        'operations': ['write', 'read', 'delete'],
        'content': content
    })

@app.route('/error')
def error_route():
    """Route to test error detection and handling"""
    # This will cause an error
    undefined_variable = some_undefined_function()
    return undefined_variable

@app.route('/dependencies')
def show_dependencies():
    """Route to show module dependencies"""
    import sys
    return jsonify({
        'modules': list(sys.modules.keys()),
        'python_version': sys.version
    })

@app.route('/process-info')
def process_info():
    """Route to show process information"""
    process = psutil.Process()
    return jsonify({
        'pid': process.pid,
        'cpu_percent': process.cpu_percent(),
        'memory_percent': process.memory_percent(),
        'threads': process.num_threads(),
        'open_files': len(process.open_files()),
        'connections': len(process.connections())
    })

if __name__ == '__main__':
    # Add some initial data to test monitoring
    with open('config.txt', 'w') as f:
        f.write('test_config: value')
    
    print("Starting test application...")
    print("Available routes:")
    print("  /              - Basic status")
    print("  /cpu-intensive - Test CPU monitoring")
    print("  /memory-leak   - Test memory monitoring")
    print("  /file-operations - Test file monitoring")
    print("  /error         - Test error handling")
    print("  /dependencies  - Show dependencies")
    print("  /process-info  - Show process information")
    
    app.run(host='0.0.0.0', port=5000, debug=True)