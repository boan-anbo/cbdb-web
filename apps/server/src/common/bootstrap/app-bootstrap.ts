import { INestApplication } from '@nestjs/common';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { CBDBServerValidationPipe } from '../pipes/logging-validation.pipe';
import { DocsModule } from '../../docs/docs.module';

/**
 * Common bootstrap configuration for both server and desktop apps
 * Ensures consistent setup across environments
 */
export function setupCommonAppFeatures(app: INestApplication, port: number): void {
  // Set global API prefix - MUST be done before documentation setup
  app.setGlobalPrefix('api');

  // Global exception filter to return error details
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global CBDB Server validation pipe with logging and transformation
  app.useGlobalPipes(new CBDBServerValidationPipe());

  // Enable CORS for cross-origin requests
  app.enableCors();

  // Setup API documentation with proper /api prefix handling and actual port
  DocsModule.setup(app, port);
}