import { Module } from '@nestjs/common';
import { Xml2objectService } from './xml2object.service';

@Module({
  providers: [Xml2objectService],
  exports: [Xml2objectService],
})
export class Xml2objectModule {}
