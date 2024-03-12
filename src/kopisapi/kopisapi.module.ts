import { Module } from '@nestjs/common';
import { KopisapiService } from './kopisapi.service';
import { HttpModule } from '@nestjs/axios';
import { Xml2objectModule } from 'src/xml2object/xml2object.module';

@Module({
  imports: [HttpModule, Xml2objectModule],
  providers: [KopisapiService],
  exports: [KopisapiService],
})
export class KopisapiModule {}
