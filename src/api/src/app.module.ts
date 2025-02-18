import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as fromControllers from './controllers';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ...fromControllers.controllers],
  providers: [AppService],
})
export class AppModule {}
