import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElectronModule } from '@doubleshot/nest-electron';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CbdbModule } from './db/cbdb.module';
import { UsersModule } from './users/users.module';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { PersonModule } from './person/person.module';
import { ServerModule } from './server/server.module';
import { Window } from './window/window.service';

/**
 * Electron-specific application module
 * Archive extraction is handled by Electron main process, not the server
 */
@Module({})
export class AppElectronModule {
  static forRoot(options?: { isElectron?: boolean }): DynamicModule {
    const baseModules = [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      ServerModule,  // Server info and runtime information
      DbModule,      // App database
      CbdbModule,    // CBDB database
      UsersModule,
      AppSettingsModule,
      // Archive module removed - extraction handled by Electron
      PersonModule,  // All CBDB repositories and services
    ];

    // Add ElectronModule only when running in Electron
    const imports = options?.isElectron
      ? [ElectronModule.registerAsync({
          isGlobal: true,
          useFactory: async () => {
            const isDev = !require('electron').app.isPackaged;
            return {
              ipcPrefix: '',
              isDev,
            } as any;
          },
        }), ...baseModules]
      : baseModules;

    const providers = options?.isElectron
      ? [AppService, Window]
      : [AppService];

    return {
      module: AppElectronModule,
      imports,
      controllers: [AppController],
      providers,
      exports: providers,
    };
  }
}