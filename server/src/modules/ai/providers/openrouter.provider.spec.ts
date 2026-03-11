import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { OpenRouterProvider } from './openrouter.provider';
import {
  AIProviderType,
  AIProviderConfig,
  AIRequest,
  ChatMessage,
} from '../interfaces/ai.interface';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenRouterProvider,
        {
          provide: 'AIProviderConfig',
          useValue: mockConfig,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<OpenRouterProvider>(OpenRouterProvider);
    httpService = module.get<HttpService>(HttpService);
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

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

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

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.chat(mockRequest);

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].function.name).toBe('get_weather');
    });

    it('should use custom model when provided', async () => {
      const customModelRequest: AIRequest = {
        messages: mockMessages,
        config: {
          model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(customModelRequest);

      expect(postSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        }),
        expect.any(Object),
      );
    });

    it('should include HTTP-Referer and X-Title headers', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      const postSpy = jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

      await provider.chat(mockRequest);

      const callArgs = postSpy.mock.calls[0];
      const headers = callArgs[2]?.headers;

      expect(headers).toBeDefined();
      expect(headers!['HTTP-Referer']).toBeDefined();
      expect(headers!['X-Title']).toBeDefined();
      expect(headers!['Authorization']).toBe(`Bearer ${mockConfig.apiKey}`);
    });

    it('should handle 402 Payment Required error', async () => {
      const error402 = new AxiosError('Request failed with status code 402');
      error402.response = {
        status: 402,
        data: {},
      } as any;

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error402));

      await expect(provider.chat(mockRequest)).rejects.toMatchObject({
        code: 'PAYMENT_REQUIRED',
        provider: AIProviderType.OPENROUTER,
      });
    });

    it('should handle rate limit error (429)', async () => {
      const error429 = new AxiosError('Request failed with status code 429');
      error429.response = {
        status: 429,
        data: {},
      } as any;

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => error429));

      await expect(provider.chat(mockRequest)).rejects.toMatchObject({
        code: 'RATE_LIMIT',
        provider: AIProviderType.OPENROUTER,
      });
    });

    it('should handle timeout error', async () => {
      const timeoutError = new Error('Timeout');
      (timeoutError as any).code = 'ECONNABORTED';

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => timeoutError));

      await expect(provider.chat(mockRequest)).rejects.toMatchObject({
        code: 'TIMEOUT',
        provider: AIProviderType.OPENROUTER,
      });
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      (networkError as any).code = 'ENOTFOUND';

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => networkError));

      await expect(provider.chat(mockRequest)).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        provider: AIProviderType.OPENROUTER,
      });
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
          code: 'invalid_api_key',
        },
      };

      const mockResponse: Partial<AxiosResponse> = {
        data: errorResponse,
        status: 200,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as AxiosResponse));

      await expect(provider.chat(mockRequest)).rejects.toMatchObject({
        code: 'invalid_api_key',
        message: 'Invalid API key',
        provider: AIProviderType.OPENROUTER,
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true when health check succeeds', async () => {
      const mockResponse: Partial<AxiosResponse> = {
        data: {},
        status: 200,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as AxiosResponse));

      const result = await provider.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when health check fails', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('Failed')));

      const result = await provider.healthCheck();

      expect(result).toBe(false);
    });

    it('should fallback to chat completion if models endpoint returns 404', async () => {
      const error404 = new AxiosError('Not Found');
      error404.response = { status: 404 } as any;

      const mockChatResponse: Partial<AxiosResponse> = {
        data: mockSuccessResponse,
        status: 200,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error404));
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockChatResponse as AxiosResponse));

      const result = await provider.healthCheck();

      expect(result).toBe(true);
    });
  });

  describe('getAvailableModels', () => {
    it('should return available models', () => {
      const models = provider.getAvailableModels();

      expect(models).toContain('meta-llama/llama-3.3-70b-instruct:free');
      expect(models.length).toBeGreaterThan(0);
    });

    it('should return custom models if configured', () => {
      const customConfig: AIProviderConfig = {
        ...mockConfig,
        availableModels: ['custom-model-1', 'custom-model-2'],
      };

      const customProvider = new OpenRouterProvider(customConfig, httpService);
      const models = customProvider.getAvailableModels();

      expect(models).toEqual(['custom-model-1', 'custom-model-2']);
    });
  });

  describe('validateConfig', () => {
    it('should return true when config is valid', () => {
      expect(provider.validateConfig()).toBe(true);
    });

    it('should return false when apiKey is missing', () => {
      const invalidConfig: AIProviderConfig = {
        ...mockConfig,
        apiKey: '',
      };

      const invalidProvider = new OpenRouterProvider(invalidConfig, httpService);
      expect(invalidProvider.validateConfig()).toBe(false);
    });

    it('should return false when defaultModel is missing', () => {
      const invalidConfig: AIProviderConfig = {
        ...mockConfig,
        defaultModel: '',
      };

      const invalidProvider = new OpenRouterProvider(invalidConfig, httpService);
      expect(invalidProvider.validateConfig()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when provider is available', () => {
      expect(provider.isAvailable).toBe(true);
    });

    it('should return false when provider is not available', () => {
      const invalidConfig: AIProviderConfig = {
        ...mockConfig,
        apiKey: '',
      };

      const invalidProvider = new OpenRouterProvider(invalidConfig, httpService);
      expect(invalidProvider.isAvailable).toBe(false);
    });
  });

  describe('getFreeModels', () => {
    it('should return only free models', () => {
      const freeModels = provider.getFreeModels();

      expect(freeModels.length).toBeGreaterThan(0);
      freeModels.forEach(model => {
        expect(model).toContain(':free');
      });
    });
  });

  describe('isFreeModel', () => {
    it('should return true for free models', () => {
      expect(provider.isFreeModel('meta-llama/llama-3.3-70b-instruct:free')).toBe(true);
      expect(provider.isFreeModel('deepseek/deepseek-r1-distill-llama-70b:free')).toBe(true);
    });

    it('should return false for non-free models', () => {
      expect(provider.isFreeModel('gpt-4')).toBe(false);
      expect(provider.isFreeModel('claude-3-opus')).toBe(false);
    });
  });
});
