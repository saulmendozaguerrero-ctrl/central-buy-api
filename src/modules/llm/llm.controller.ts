import { Controller, Get, Post, Body } from '@nestjs/common';
import { LLMFallbackService } from '../../services/llm-fallback.service';

@Controller('api/llm')
export class LLMController {
  constructor(private readonly llmService: LLMFallbackService) {}

  @Post('test')
  async testFallback(@Body() { prompt, maxTokens = 150 }: { prompt: string; maxTokens?: number }) {
    return await this.llmService.callWithFallback(
      prompt,
      maxTokens,
      'You are a helpful assistant for Central Buy. Keep responses concise.',
    );
  }

  @Get('metrics')
  getMetrics() {
    return this.llmService.getMetrics();
  }

  @Post('reset-metrics')
  resetMetrics() {
    this.llmService.resetMetrics();
    return { message: 'Metrics reset' };
  }
}
