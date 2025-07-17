import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IAAnalysis } from './entities/ia-analysis.entity';
import { IAAnalysesService } from './ia-analyses.service';
import { IAAnalysesController } from './ia-analyses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IAAnalysis])],
  providers: [IAAnalysesService],
  controllers: [IAAnalysesController],
  exports: [IAAnalysesService],
})
export class IAAnalysesModule {} 