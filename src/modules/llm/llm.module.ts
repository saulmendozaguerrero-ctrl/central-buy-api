import { Module } from '@nestjs/common';
import { LLMFallbackService } from '../../services/llm-fallback.service';
import { LLMController } from './llm.controller';

@Module({
  controllers: [LLMController],
  providers: [LLMFallbackService],
  exports: [LLMFallbackService],
})
export class LLMModule {}
