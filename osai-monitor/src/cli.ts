#!/usr/bin/env node
import { OSAiMonitor } from './index.js';
import path from 'path';

const args = process.argv.slice(2);
const usage = `
OSAi Monitor - Intelligent File System Monitoring

Usage:
  osai-monitor [options] [paths...]

Options:
  --help, -h     Show this help message
  --exclude, -e  Exclude pattern (can be used multiple times)
  
Examples:
  osai-monitor                    # Monitor current directory
  osai-monitor src tests         # Monitor specific directories
  osai-monitor -e "*.log" src    # Monitor src excluding log files
`;

// Parse command line arguments
const parseArgs = () => {
  const options = {
    watchPaths: [] as string[],
    excludePaths: [] as string[]
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      console.log(usage);
      process.exit(0);
    }
    
    if (arg === '--exclude' || arg === '-e') {
      if (i + 1 < args.length) {
        options.excludePaths.push(args[++i]);
      } else {
        console.error('Error: --exclude option requires a pattern');
        process.exit(1);
      }
    } else {
      options.watchPaths.push(arg);
    }
  }

  // If no paths specified, use current directory
  if (options.watchPaths.length === 0) {
    options.watchPaths.push(process.cwd());
  }

  // Convert relative paths to absolute
  options.watchPaths = options.watchPaths.map(p => 
    path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
  );

  return options;
};

const startMonitor = async () => {
  const options = parseArgs();
  
  console.log('\x1b[36m%s\x1b[0m', 'OSAi Monitor - Intelligent File System Monitoring');
  console.log('\nMonitoring directories:');
  options.watchPaths.forEach(p => console.log(`  - ${p}`));
  
  if (options.excludePaths.length > 0) {
    console.log('\nExcluding patterns:');
    options.excludePaths.forEach(p => console.log(`  - ${p}`));
  }
  
  console.log('\nPress Ctrl+C to stop monitoring\n');

  // Create monitor instance with parsed options
  const monitor = new OSAiMonitor({
    watchPaths: options.watchPaths,
    excludePaths: options.excludePaths.length > 0 
      ? [...options.excludePaths, '**/node_modules/**', '**/.git/**']
      : ['**/node_modules/**', '**/.git/**']
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\nShutting down OSAi Monitor...');
    await monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down OSAi Monitor...');
    await monitor.stop();
    process.exit(0);
  });
};

// Start the monitor
startMonitor().catch(error => {
  console.error('Error starting OSAi Monitor:', error);
  process.exit(1);
});