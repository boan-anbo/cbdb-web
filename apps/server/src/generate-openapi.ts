#!/usr/bin/env tsx
/**
 * Generate OpenAPI JSON documentation file
 * Usage: tsx src/generate-openapi.ts [output-path]
 * Default output: ../../libs/api-client/openapi.json
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

async function generateOpenApiSpec() {
  // Get output path from command line or use default (api-client package)
  const outputPath = process.argv[2] || '../../libs/api-client/openapi.json';
  const resolvedPath = resolve(outputPath);

  // Ensure directory exists
  mkdirSync(dirname(resolvedPath), { recursive: true });

  // Create NestJS application without listening
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable logging during generation
  });

  // Configure Swagger/OpenAPI - same config as main.ts
  const config = new DocumentBuilder()
    .setTitle('CBDB Desktop API')
    .setDescription('The CBDB Desktop API with Drizzle ORM')
    .setVersion('1.0')
    .addTag('api')
    .addTag('People', 'Operations related to biographical data')
    .addTag('Users', 'User management operations')
    .addTag('Settings', 'Application settings')
    .build();

  // Generate the OpenAPI document
  const document = SwaggerModule.createDocument(app, config);

  // Write to file
  writeFileSync(resolvedPath, JSON.stringify(document, null, 2));

  console.log(`✅ OpenAPI specification generated successfully!`);
  console.log(`📄 Output file: ${resolvedPath}`);

  // Close the app
  await app.close();
}

// Run the generator
generateOpenApiSpec().catch((error) => {
  console.error('❌ Failed to generate OpenAPI specification:', error);
  process.exit(1);
});