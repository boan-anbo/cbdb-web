import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './config/env.config';
import { setupCommonAppFeatures } from './common/bootstrap/app-bootstrap';
import { findAvailablePort, shouldAllowPortFallback } from './common/utils/port-finder';
import { logServerStartup, logPortResolution } from './common/utils/server-logging.utils';
import { ServerInfoService } from './server/server-info.service';

/**
 * Bootstrap the standalone NestJS server
 *
 * Port Resolution Strategy:
 * 1. Try to use the port from environment/config
 * 2. In development/Electron: automatically find an alternative if occupied
 * 3. In production/web: fail if the specified port is not available
 * 4. Update ServerInfoService with the actual port
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const preferredPort = envConfig.PORT;

  // Determine if we should allow port fallback based on deployment mode
  const allowFallback = shouldAllowPortFallback();

  // Find an available port using deployment-aware options
  const finalPort = await findAvailablePort(preferredPort, { allowFallback });

  // Log port resolution
  logPortResolution(preferredPort, finalPort);

  // Setup the app with the final port only once
  setupCommonAppFeatures(app, finalPort);

  // Start the server on the verified available port
  await app.listen(finalPort);

  // Success! Log the server URLs with the correct port
  logServerStartup(finalPort);

  // Update ServerInfoService with the actual port if it exists
  try {
    const serverInfoService = app.get(ServerInfoService);
    serverInfoService.setPort(finalPort);
    console.log(`ServerInfoService: Port set to ${finalPort}`);
  } catch (e) {
    console.debug('ServerInfoService not available for port update');
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});