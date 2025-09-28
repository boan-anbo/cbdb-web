import { ValidationPipe, BadRequestException, Logger, ArgumentMetadata } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * CBDB Server Custom ValidationPipe that extends NestJS built-in ValidationPipe
 * Adds logging for validation errors while preserving all validation functionality
 * Enables transform and implicit conversion for automatic type conversion
 */
export class CBDBServerValidationPipe extends ValidationPipe {
  private readonly logger = new Logger('CBDBServerValidationPipe');

  constructor() {
    super({
      transform: true, // Enable automatic transformation
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error on extra properties
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion (string to number, etc.)
      },
      exceptionFactory: (errors: ValidationError[]) => {
        // Log validation errors with detailed information
        const errorDetails = errors.map(err => ({
          property: err.property,
          value: err.value,
          constraints: err.constraints ? Object.values(err.constraints) : [],
        }));

        // Log with NestJS logger in a clean format
        this.logger.error('✗ Validation failed:');
        errorDetails.forEach(err => {
          this.logger.error(`  - Property "${err.property}": value="${err.value}"`);
          err.constraints.forEach(constraint => {
            this.logger.error(`    → ${constraint}`);
          });
        });

        // Format error message for response
        const messages = errors
          .map(err => {
            const constraints = err.constraints ? Object.values(err.constraints) : [];
            return `${err.property}: ${constraints.join(', ')}`;
          })
          .join('; ');

        return new BadRequestException({
          message: 'Validation failed',
          details: messages,
          errors: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
          })),
        });
      },
    });
  }

  /**
   * Override transform to add logging for validation errors only
   */
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      // Call parent transform without logging
      const result = await super.transform(value, metadata);
      return result;
    } catch (error) {
      // Log the incoming data that failed validation
      const dataName = metadata.data || metadata.type || 'unknown';
      this.logger.error(`Failed to validate ${metadata.type} "${dataName}": ${JSON.stringify(value)}`);

      // Error details will be logged by exceptionFactory
      throw error;
    }
  }
}