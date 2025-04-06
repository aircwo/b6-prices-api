
import { FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyCheck } from '../authHook';

jest.mock('../../config/index', () => ({
  config: {
    apiKey: 'test-api-key',
  }
}));

describe('apiKeyCheck', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    jest.resetModules();

    mockRequest = {
      headers: {},
    };
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should allow request with valid x-api-key', async () => {
    mockRequest.headers = { 'x-api-key': 'test-api-key' };

    await apiKeyCheck(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should reject request with missing x-api-key', async () => {
    mockRequest.headers = {}; // No x-api-key

    await apiKeyCheck(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorised' });
  });

  it('should reject request with invalid x-api-key', async () => {
    mockRequest.headers = { 'x-api-key': 'wrong-key' };

    await apiKeyCheck(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.code).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorised' });
  });
});