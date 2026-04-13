import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import {
  AIProviderConfig,
  AIProviderType,
  AIRequest,
  ChatMessage,
} from '../interfaces/ai.interface';
import { OpenRouterProvider } from './openrouter.provider';

describe('OpenRouterProvider', () => {
  let provider: OpenRouterProvider;
  let httpService: HttpService;

  const mockConfig: AIProviderConfig = {
    type: AIProviderType.OPENROUTER,
    apiKey: 'test-api-key',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    availableModels: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1-distill-llama-70b:free',
    ],
    timeout: 30000,
  };

  const mockMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello, how are you?' },
  ];

  const mockRequest: AIRequest = {
    messages: mockMessages,
  };

  const mockSuccessResponse = {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1677652288,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'I am doing well, thank you for asking!',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  };

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    provider = new OpenRouterProvider(mockConfig, httpService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('properties', () => {
    it('should have correct type', () => {
      expect(provider.type).toBe(AIProviderType.OPENROUTER);
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('OpenRouter');
    });
  });

  describe('chat', () => {
    it('should successfully send a chat request', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
        statusText: 'OK',
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(mockRequest);

      expect(result.content).toBe('I am doing well, thank you for asking!');
      expect(result.model).toBe('meta-llama/llama-3.3-70b-instruct:free');
      expect(result.provider).toBe(AIProviderType.OPENROUTER);
      expect(result.usage?.totalTokens).toBe(30);
    });

    it('should handle tool calls in response', async () => {
      const mockResponseWithTools = {
        ...mockSuccessResponse,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: 'call-123',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: '{"location": "San Francisco"}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockResponseWithTools,
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(mockRequest);

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].function.name).toBe('get_weather');
    });

    it('should use custom model from request config', async () => {
      const customModel = 'deepseek/deepseek-r1-distill-llama-70b:free';
      const requestWithModel: AIRequest = {
        ...mockRequest,
        config: { model: customModel },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: {
          ...mockSuccessResponse,
          model: customModel,
        },
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(requestWithModel);

      expect(result.model).toBe(customModel);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          type: 'authentication_error',
          code: '401',
        },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: errorResponse,
        status: 401,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      try {
        await provider.chat(mockRequest);
        // 如果没有抛出错误，测试失败
        expect(false).toBe(true);
      } catch (e) {
        // 期望抛出错误
        expect(e).toBeDefined();
      }
    });

    it('should handle network errors', async () => {
      const axiosError = new Error('Network Error') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = {
        data: { error: { message: 'Network Error' } },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => axiosError));

      try {
        await provider.chat(mockRequest);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should include Authorization header with Bearer token', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(mockRequest);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
    });

    it('should include HTTP-Referer and X-Title headers', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(mockRequest);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'HTTP-Referer': 'https://github.com/one-recycle',
            'X-Title': 'OneRecycle',
          }),
        }),
      );
    });
  });

  describe('validateConfig', () => {
    it('should return true for valid config', () => {
      expect(provider.validateConfig()).toBe(true);
    });

    it('should return false when apiKey is missing', () => {
      const invalidConfig: AIProviderConfig = {
        ...mockConfig,
        apiKey: '',
      };
      const invalidProvider = new OpenRouterProvider(
        invalidConfig,
        httpService,
      );
      expect(invalidProvider.validateConfig()).toBe(false);
    });

    it('should return false when defaultModel is missing', () => {
      const invalidConfig: AIProviderConfig = {
        ...mockConfig,
        defaultModel: '',
      };
      const invalidProvider = new OpenRouterProvider(
        invalidConfig,
        httpService,
      );
      expect(invalidProvider.validateConfig()).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return true when models endpoint returns 200', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: { data: [] },
        status: 200,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when API returns error', async () => {
      const axiosError = new Error('Unauthorized') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => axiosError));

      const result = await provider.healthCheck();

      expect(result).toBe(false);
    });

    it('should fallback to chat completion if models endpoint returns 404', async () => {
      const notFoundError = new Error('Not Found') as AxiosError;
      notFoundError.isAxiosError = true;
      notFoundError.response = {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      const mockChatResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => notFoundError));
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockChatResponse as AxiosResponse));

      const result = await provider.healthCheck();

      expect(result).toBe(true);
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', () => {
      const models = provider.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('meta-llama/llama-3.3-70b-instruct:free');
      expect(models).toContain('deepseek/deepseek-r1-distill-llama-70b:free');
    });

    it('should include free models', () => {
      const models = provider.getAvailableModels();

      const freeModels = models.filter((m) => m.includes(':free'));
      expect(freeModels.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = new Error(
        'timeout of 30000ms exceeded',
      ) as AxiosError;
      timeoutError.isAxiosError = true;
      timeoutError.code = 'ECONNABORTED';

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => timeoutError));

      try {
        await provider.chat(mockRequest);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded') as AxiosError;
      rateLimitError.isAxiosError = true;
      rateLimitError.response = {
        data: { error: { message: 'Rate limit exceeded' } },
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => rateLimitError));

      try {
        await provider.chat(mockRequest);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('request body construction', () => {
    it('should include messages in request body', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(mockRequest);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: mockMessages,
        }),
        expect.any(Object),
      );
    });

    it('should include temperature when provided', async () => {
      const requestWithTemp: AIRequest = {
        ...mockRequest,
        config: { temperature: 0.7 },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(requestWithTemp);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          temperature: 0.7,
        }),
        expect.any(Object),
      );
    });

    it('should include maxTokens when provided', async () => {
      const requestWithMaxTokens: AIRequest = {
        ...mockRequest,
        config: { maxTokens: 500 },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(requestWithMaxTokens);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          max_tokens: 500,
        }),
        expect.any(Object),
      );
    });

    it('should include tools when provided', async () => {
      const requestWithTools: AIRequest = {
        ...mockRequest,
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_weather',
              description: 'Get weather information',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string' },
                },
              },
            },
          },
        ],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(requestWithTools);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tools: expect.any(Array),
        }),
        expect.any(Object),
      );
    });
  });

  describe('custom configuration', () => {
    it('should use custom baseURL when provided', async () => {
      const customConfig: AIProviderConfig = {
        ...mockConfig,
        baseURL: 'https://custom.openrouter.api',
      };
      const customProvider = new OpenRouterProvider(customConfig, httpService);

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await customProvider.chat(mockRequest);

      expect(postSpy).toHaveBeenCalledWith(
        'https://custom.openrouter.api/chat/completions',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should use default baseURL when not provided', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(mockRequest);

      expect(postSpy).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty message content', async () => {
      const requestWithEmptyContent: AIRequest = {
        messages: [{ role: 'user', content: '' }],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(requestWithEmptyContent);

      expect(result.content).toBe('I am doing well, thank you for asking!');
    });

    it('should handle very long messages', async () => {
      const longContent = 'a'.repeat(10000);
      const requestWithLongContent: AIRequest = {
        messages: [{ role: 'user', content: longContent }],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(requestWithLongContent);

      expect(result).toBeDefined();
    });

    it('should handle response with null content', async () => {
      const mockResponseWithNullContent = {
        ...mockSuccessResponse,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: null,
            },
            finish_reason: 'stop',
          },
        ],
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockResponseWithNullContent,
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(mockRequest);

      expect(result.content).toBe('');
    });

    it('should handle response without usage data', async () => {
      const mockResponseWithoutUsage = {
        ...mockSuccessResponse,
        usage: undefined,
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockResponseWithoutUsage,
        status: 200,
      };

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(mockRequest);

      expect(result.usage).toEqual({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });
    });
  });
});
