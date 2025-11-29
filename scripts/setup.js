#!/usr/bin/env node
/**
 * DESPERADOS DESTINY - Setup Script
 *
 * This script initializes the development environment:
 * 1. Creates .env file from .env.example
 * 2. Generates secure JWT secrets
 * 3. Checks prerequisites (Node, Docker, etc.)
 * 4. Creates necessary directories
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
};

// Generate secure random string
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Check if command exists
const commandExists = (command) => {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Main setup function
async function setup() {
  log.header('🤠 DESPERADOS DESTINY - DEVELOPMENT SETUP');
  log.info('Setting up your local development environment...\n');

  // Step 1: Check prerequisites
  log.header('STEP 1: Checking Prerequisites');

  const nodeVersion = process.version;
  const requiredNodeVersion = 18;
  const currentNodeVersion = parseInt(nodeVersion.split('.')[0].substring(1), 10);

  if (currentNodeVersion >= requiredNodeVersion) {
    log.success(`Node.js ${nodeVersion} (required: >= v${requiredNodeVersion})`);
  } else {
    log.error(`Node.js ${nodeVersion} is too old. Please upgrade to v${requiredNodeVersion} or higher.`);
    process.exit(1);
  }

  if (commandExists('npm')) {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    log.success(`npm ${npmVersion}`);
  } else {
    log.error('npm is not installed');
    process.exit(1);
  }

  if (commandExists('docker')) {
    const dockerVersion = execSync('docker --version', { encoding: 'utf-8' }).trim();
    log.success(`${dockerVersion}`);
  } else {
    log.warn('Docker is not installed - required for "npm run dev"');
    log.info('You can still run locally with "npm run dev:local"');
  }

  if (commandExists('docker-compose') || commandExists('docker')) {
    log.success('Docker Compose is available');
  } else {
    log.warn('Docker Compose is not available');
  }

  // Step 2: Create .env file
  log.header('\nSTEP 2: Creating Environment File');

  const rootDir = path.resolve(__dirname, '..');
  const envExamplePath = path.join(rootDir, '.env.example');
  const envPath = path.join(rootDir, '.env');

  if (fs.existsSync(envPath)) {
    log.warn('.env file already exists - skipping creation');
    log.info('If you want to regenerate it, delete .env and run setup again');
  } else {
    if (!fs.existsSync(envExamplePath)) {
      log.error('.env.example not found!');
      process.exit(1);
    }

    // Read .env.example
    let envContent = fs.readFileSync(envExamplePath, 'utf-8');

    // Generate secure secrets
    log.info('Generating secure JWT secrets...');
    const jwtSecret = generateSecret(64);
    const jwtRefreshSecret = generateSecret(64);
    const sessionSecret = generateSecret(32);

    // Replace placeholders
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${jwtSecret}`
    );
    envContent = envContent.replace(
      /JWT_REFRESH_SECRET=.*/,
      `JWT_REFRESH_SECRET=${jwtRefreshSecret}`
    );
    envContent = envContent.replace(
      /SESSION_SECRET=.*/,
      `SESSION_SECRET=${sessionSecret}`
    );

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    log.success('.env file created with secure secrets');
  }

  // Step 3: Create necessary directories
  log.header('\nSTEP 3: Creating Directories');

  const directories = [
    'server/logs',
    'server/src',
    'client/src',
    'shared/types',
    'docker/mongo-init',
  ];

  directories.forEach((dir) => {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log.success(`Created ${dir}`);
    } else {
      log.info(`${dir} already exists`);
    }
  });

  // Step 4: Create MongoDB init script
  log.header('\nSTEP 4: Creating MongoDB Initialization Script');

  const mongoInitPath = path.join(rootDir, 'docker/mongo-init/init.js');
  if (!fs.existsSync(mongoInitPath)) {
    const mongoInitScript = `// MongoDB Initialization Script
// This runs when MongoDB container is first created

db = db.getSiblingDB('desperados-destiny');

// Create collections
db.createCollection('users');
db.createCollection('characters');
db.createCollection('gangs');
db.createCollection('territories');
db.createCollection('sessions');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.characters.createIndex({ userId: 1 });
db.characters.createIndex({ name: 1 }, { unique: true });
db.gangs.createIndex({ name: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Database initialized successfully!');
`;
    fs.writeFileSync(mongoInitPath, mongoInitScript);
    log.success('MongoDB initialization script created');
  } else {
    log.info('MongoDB init script already exists');
  }

  // Step 5: Summary
  log.header('\n✅ SETUP COMPLETE!');
  console.log('\nNext steps:');
  console.log('  1. Review the .env file and update any values if needed');
  console.log('  2. Install dependencies: npm install');
  console.log('  3. Start development:');
  console.log('     - With Docker:   npm run dev');
  console.log('     - Without Docker: npm run dev:local');
  console.log('  4. Visit http://localhost:5173 (frontend)');
  console.log('  5. API available at http://localhost:5000');
  console.log('\nUseful commands:');
  console.log('  npm run logs       - View all container logs');
  console.log('  npm run stop       - Stop all containers');
  console.log('  npm run clean      - Clean up Docker volumes');
  console.log('  npm run health     - Check if services are healthy');
  console.log('\n🤠 Happy coding, partner!\n');
}

// Run setup
setup().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
