import subprocess
import time
import requests
import psutil
import os
from typing import List, Dict, Any

class TestMonitor:
    """Test class to validate OSAi monitoring capabilities"""
    
    def __init__(self):
        self.app_process = None
        self.monitor_process = None
        self.base_url = "http://localhost:5000"
    
    def start_app(self):
        """Start the test Flask application"""
        print("\n🚀 Starting test application...")
        self.app_process = subprocess.Popen(
            ["python", "app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)  # Wait for app to start
    
    def start_osai_monitor(self):
        """Start OSAi monitor"""
        print("\n🔍 Starting OSAi monitor...")
        self.monitor_process = subprocess.Popen(
            ["osai-monitor", "watch and analyze app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)  # Wait for monitor to start
    
    def run_tests(self):
        """Run a series of tests to validate OSAi functionality"""
        try:
            print("\n🧪 Running tests...")
            
            # Test basic monitoring
            self._test_basic_monitoring()
            
            # Test CPU monitoring
            self._test_cpu_monitoring()
            
            # Test memory monitoring
            self._test_memory_monitoring()
            
            # Test file operations
            self._test_file_operations()
            
            # Test error handling
            self._test_error_handling()
            
            print("\n✅ All tests completed successfully!")
            
        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            raise
        finally:
            self.cleanup()
    
    def _test_basic_monitoring(self):
        """Test basic application monitoring"""
        print("\n📊 Testing basic monitoring...")
        response = requests.get(f"{self.base_url}/")
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
        assert 'pid' in data
        print("  ✓ Basic monitoring working")
    
    def _test_cpu_monitoring(self):
        """Test CPU usage monitoring"""
        print("\n💻 Testing CPU monitoring...")
        response = requests.get(f"{self.base_url}/cpu-intensive")
        assert response.status_code == 200
        data = response.json()
        assert 'cpu_percent' in data
        assert float(data['cpu_percent']) > 0
        print("  ✓ CPU monitoring working")
    
    def _test_memory_monitoring(self):
        """Test memory usage monitoring"""
        print("\n🧠 Testing memory monitoring...")
        response = requests.get(f"{self.base_url}/memory-leak")
        assert response.status_code == 200
        data = response.json()
        assert 'memory_percent' in data
        assert float(data['memory_percent']) > 0
        print("  ✓ Memory monitoring working")
    
    def _test_file_operations(self):
        """Test file operation monitoring"""
        print("\n📁 Testing file operations monitoring...")
        response = requests.get(f"{self.base_url}/file-operations")
        assert response.status_code == 200
        data = response.json()
        assert 'operations' in data
        assert len(data['operations']) == 3  # write, read, delete
        print("  ✓ File operations monitoring working")
    
    def _test_error_handling(self):
        """Test error detection and handling"""
        print("\n🐛 Testing error handling...")
        response = requests.get(f"{self.base_url}/error")
        assert response.status_code == 500  # Should be an error
        print("  ✓ Error handling working")
    
    def cleanup(self):
        """Clean up processes and temporary files"""
        print("\n🧹 Cleaning up...")
        
        if self.app_process:
            self.app_process.terminate()
            self.app_process.wait()
        
        if self.monitor_process:
            self.monitor_process.terminate()
            self.monitor_process.wait()
        
        # Clean up any temporary files
        if os.path.exists('test.txt'):
            os.remove('test.txt')
        if os.path.exists('config.txt'):
            os.remove('config.txt')
        
        print("  ✓ Cleanup completed")

def main():
    """Main test function"""
    print("\n🎯 Starting OSAi monitoring tests...")
    monitor = TestMonitor()
    
    try:
        monitor.start_app()
        monitor.start_osai_monitor()
        monitor.run_tests()
    except Exception as e:
        print(f"\n❌ Tests failed: {str(e)}")
        raise
    finally:
        monitor.cleanup()
    
    print("\n🎉 All tests completed successfully!")

if __name__ == "__main__":
    main()