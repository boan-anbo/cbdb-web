import { Module, DynamicModule, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as yaml from 'js-yaml';
import { Request, Response } from 'express';

@Module({})
export class DocsModule {
  static setup(app: INestApplication, port: number): void {
    // Detect deployment mode
    const isElectron = !!(process.versions as any)?.electron;
    const isProduction = process.env.NODE_ENV === 'production';
    const isWebProduction = isProduction && !isElectron;

    console.log('[DocsModule] Environment Detection:', {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      isElectron,
      isProduction,
      isWebProduction
    });

    // Build the server URL dynamically based on deployment mode
    const configBuilder = new DocumentBuilder()
      .setTitle('CBDB Desktop API')
      .setDescription('The CBDB Desktop API with Drizzle ORM')
      .setVersion('1.0');

    // Configure servers based on deployment mode
    if (isWebProduction) {
      // Web production: use PUBLIC_URL if available
      const publicUrl = process.env.PUBLIC_URL || process.env.BASE_URL;
      if (publicUrl) {
        configBuilder.addServer(publicUrl, 'Production Server');
      } else if (process.env.API_PREFIX) {
        // Fallback to API_PREFIX (without doubling /cbdb)
        configBuilder.addServer(`/${process.env.API_PREFIX}`, 'Production Server');
      }
      // Also add localhost as a secondary option
      configBuilder.addServer(`http://localhost:${port}`, 'Local Development Server');
    } else {
      // Electron and development: use localhost only
      configBuilder.addServer(`http://localhost:${port}`, 'Local Server');
    }

    const config = configBuilder
      .addTag('api')
      .addTag('People', 'Operations related to biographical data')
      .addTag('Users', 'User management operations')
      .addTag('Settings', 'Application settings')
      .build();

    // Create document with options to include the global prefix
    const options = {
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => methodKey
    };

    const document = SwaggerModule.createDocument(app, config, options);

    // 1. Classic Swagger UI at /docs/swagger
    SwaggerModule.setup('docs/swagger', app, document, {
      customSiteTitle: 'CBDB API - Swagger UI',
      customfavIcon: 'https://swagger.io/favicon-32x32.png',
    });

    // 2. OpenAPI JSON endpoint at /docs/openapi.json
    app.use('/docs/openapi.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(document, null, 2));
    });

    // 3. OpenAPI YAML endpoint at /docs/openapi.yaml
    app.use('/docs/openapi.yaml', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/yaml');
      const yamlStr = yaml.dump(document);
      res.send(yamlStr);
    });

    // 4. OpenAPI Markdown endpoint at /docs/openapi.md
    app.use('/docs/openapi.md', async (req: Request, res: Response) => {
      try {
        const { createMarkdownFromOpenApi } = await import('@scalar/openapi-to-markdown');
        const markdown = await createMarkdownFromOpenApi(JSON.stringify(document));
        res.setHeader('Content-Type', 'text/markdown');
        res.send(markdown);
      } catch (error) {
        res.status(500).json({ error: 'Failed to generate markdown documentation' });
      }
    });

    // 5. Scalar API Reference at /docs/scalar
    app.use(
      '/docs/scalar',
      apiReference({
        content: document,
        theme: 'purple',
        layout: 'modern',
        showSidebar: true,
        searchHotKey: 'k',
        metaData: {
          title: 'CBDB API - Scalar Reference',
          description: 'Interactive API documentation powered by Scalar',
        },
        customCss: `
          .scalar-api-reference {
            --scalar-color-1: #6366f1;
            --scalar-color-2: #8b5cf6;
            --scalar-color-accent: #ec4899;
          }
        `,
      }),
    );

    // 6. Root /docs endpoint with JSON links to all documentation formats
    app.use('/docs', (req: Request, res: Response) => {
      if (req.path !== '/') {
        return;
      }

      // Build the base URL dynamically based on the request
      // This handles both local (http://localhost:18019/docs) and
      // production (https://dh-tools.com/api/cbdb/docs) scenarios

      // Detect deployment mode
      const isElectron = !!(process.versions as any)?.electron;
      const isProduction = process.env.NODE_ENV === 'production';
      const isWebProduction = isProduction && !isElectron;

      // Get the host
      const host = req.get('host');

      let fullBaseUrl: string;
      if (isWebProduction) {
        // Web production: use PUBLIC_URL if available
        const publicUrl = process.env.PUBLIC_URL || process.env.BASE_URL;
        if (publicUrl) {
          fullBaseUrl = `${publicUrl}/docs`;
        } else if (process.env.API_PREFIX) {
          // Fallback: construct from host and API_PREFIX
          fullBaseUrl = `https://${host}/${process.env.API_PREFIX}/docs`;
        } else {
          // Last fallback
          fullBaseUrl = `https://${host}/docs`;
        }
      } else {
        // Electron and development: use direct path with actual protocol
        const protocol = req.protocol;
        fullBaseUrl = `${protocol}://${host}/docs`;
      }

      const docsResponse = {
        title: 'CBDB API Documentation',
        description: 'Available documentation formats for the CBDB Desktop API',
        formats: [
          {
            name: 'Scalar',
            link: `${fullBaseUrl}/scalar`,
            description: 'Modern interactive API reference with beautiful UI'
          },
          {
            name: 'Swagger UI',
            link: `${fullBaseUrl}/swagger`,
            description: 'Classic OpenAPI interface with try-it-out functionality'
          },
          {
            name: 'OpenAPI JSON',
            link: `${fullBaseUrl}/openapi.json`,
            description: 'OpenAPI specification in JSON format for tooling integration'
          },
          {
            name: 'OpenAPI YAML',
            link: `${fullBaseUrl}/openapi.yaml`,
            description: 'OpenAPI specification in YAML format for human readability'
          },
          {
            name: 'OpenAPI Markdown',
            link: `${fullBaseUrl}/openapi.md`,
            description: 'API documentation in Markdown format for static documentation'
          }
        ]
      };

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(docsResponse, null, 2));
    });

    // Documentation URLs are now logged after successful server start in main.ts
    // to ensure the correct port is displayed
  }
}