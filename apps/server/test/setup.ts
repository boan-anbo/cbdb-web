import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for testing
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Different port for testing