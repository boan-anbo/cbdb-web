import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServerInfoService } from './server-info.service';
import { ServerInfoController } from './server-info.controller';
import { DeploymentConfig } from '../config/deployment.config';
import { CbdbModule } from '../db/cbdb.module';

@Global()
@Module({
  imports: [ConfigModule, CbdbModule],
  controllers: [ServerInfoController],
  providers: [ServerInfoService, DeploymentConfig],
  exports: [ServerInfoService]
})
export class ServerModule {}