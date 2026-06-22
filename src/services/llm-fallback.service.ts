import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface LLMResponse {
  content: string;
  provider: 'claude' | 'gemini' | 'zai';
  model: string;
  tokensUsed?: number;
  cached?: boolean;
}

@Injectable()
export class LLMFallbackService {
  private readonly logger = new Logger(LLMFallbackService.name);
  private readonly metrics = {
    clauseSuccess: 0,
    claudeFail: 0,
    geminiSuccess: 0,
    geminiFail: 0,
    zaiSuccess: 0,
    zaiFail: 0,
  };

  constructor(private configService: ConfigService) {}

  /**
   * Call LLM with automatic fallback chain:
   * 1. Claude Opus (primary)
   * 2. Gemini 3.1 Pro (secondary)
   * 3. ZAI GLM-4.7-Flash (fallback - FREE)
   */
  async callWithFallback(
    prompt: string,
    maxTokens: number = 1000,
    system?: string,
  ): Promise<LLMResponse> {
    this.logger.debug(
      `[LLM Fallback] Starting chain. Prompt length: ${prompt.length}`,
    );

    // 1️⃣ Try Claude Opus (primary)
    try {
      this.logger.log('[LLM] Attempting Claude Opus (primary)');
      const result = await this.callClaude(prompt, maxTokens, system);
      this.metrics.clauseSuccess++;
      return { ...result, provider: 'claude' };
    } catch (error) {
      this.metrics.claudeFail++;
      this.logger.warn(
        `[LLM] Claude failed: ${error instanceof AxiosError ? error.response?.status : error.message}. Trying Gemini.`,
      );
    }

    // 2️⃣ Try Gemini 3.1 Pro (secondary)
    try {
      this.logger.log('[LLM] Attempting Gemini 3.1 Pro (secondary)');
      const result = await this.callGemini(prompt, maxTokens, system);
      this.metrics.geminiSuccess++;
      return { ...result, provider: 'gemini' };
    } catch (error) {
      this.metrics.geminiFail++;
      this.logger.warn(
        `[LLM] Gemini failed: ${error instanceof AxiosError ? error.response?.status : error.message}. Falling back to ZAI.`,
      );
    }

    // 3️⃣ Fallback to ZAI GLM-4.7-Flash (FREE - guaranteed)
    try {
      this.logger.log(
        '[LLM] Using ZAI GLM-4.7-Flash fallback (FREE tier)',
      );
      const result = await this.callZAI(prompt, maxTokens, system);
      this.metrics.zaiSuccess++;
      return { ...result, provider: 'zai' };
    } catch (error) {
      this.metrics.zaiFail++;
      const errorMsg = `All LLM providers exhausted. Last error: ${error instanceof AxiosError ? error.response?.status : error.message}`;
      this.logger.error(`[LLM] ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }

  /**
   * Call Claude Opus via Anthropic API
   */
  private async callClaude(
    prompt: string,
    maxTokens: number,
    system?: string,
  ): Promise<Omit<LLMResponse, 'provider'>> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-6',
        max_tokens: maxTokens,
        system: system || 'You are a helpful assistant.',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    if (response.status !== 200) {
      throw new Error(`Claude API returned status ${response.status}`);
    }

    return {
      content: response.data.content[0].text,
      model: 'claude-opus-4-6',
      tokensUsed:
        response.data.usage.input_tokens +
        response.data.usage.output_tokens,
    };
  }

  /**
   * Call Gemini 3.1 Pro via Google API
   */
  private async callGemini(
    prompt: string,
    maxTokens: number,
    system?: string,
  ): Promise<Omit<LLMResponse, 'provider'>> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-1-pro-latest:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: system ? `${system}\n\n${prompt}` : prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      },
      {
        timeout: 30000,
      },
    );

    if (response.status !== 200) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    return {
      content: text,
      model: 'gemini-3-1-pro',
      tokensUsed: response.data.usageMetadata?.totalTokenCount || 0,
    };
  }

  /**
   * Call ZAI GLM-4.7-Flash (FREE TIER)
   * OpenAI-compatible endpoint
   */
  private async callZAI(
    prompt: string,
    maxTokens: number,
    system?: string,
  ): Promise<Omit<LLMResponse, 'provider'>> {
    const apiKey = process.env.ZAI_API_KEY;
    if (!apiKey) {
      throw new Error('ZAI_API_KEY not configured');
    }

    const response = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: 'glm-4-7-flash', // FREE model
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    if (response.status !== 200) {
      throw new Error(`ZAI API returned status ${response.status}`);
    }

    return {
      content: response.data.choices[0].message.content,
      model: 'glm-4-7-flash',
      tokensUsed: response.data.usage?.total_tokens || 0,
      cached: false,
    };
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      totalSuccess:
        this.metrics.clauseSuccess +
        this.metrics.geminiSuccess +
        this.metrics.zaiSuccess,
      totalFail:
        this.metrics.claudeFail +
        this.metrics.geminiFail +
        this.metrics.zaiFail,
      successRate:
        (this.metrics.clauseSuccess +
          this.metrics.geminiSuccess +
          this.metrics.zaiSuccess) /
          ((this.metrics.clauseSuccess +
            this.metrics.geminiSuccess +
            this.metrics.zaiSuccess +
            this.metrics.claudeFail +
            this.metrics.geminiFail +
            this.metrics.zaiFail) ||
            1),
      fallbackUsagePercentage:
        (this.metrics.zaiSuccess /
          (this.metrics.clauseSuccess +
            this.metrics.geminiSuccess +
            this.metrics.zaiSuccess ||
            1)) *
        100,
    };
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics() {
    Object.keys(this.metrics).forEach((key) => {
      (this.metrics as any)[key] = 0;
    });
  }
}
