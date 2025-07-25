/**
 * @jest-environment node
 */
import { GET } from '../route';
import { NextResponse } from 'next/server';

// Define proper type for the mock Request class
class MockRequest extends Request {
  constructor() {
    super('http://localhost:3000/health');
  }
}

// Mock Request object for Next.js route handlers
global.Request = MockRequest;

describe('Health Check API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should return UP status with metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toHaveProperty('status', 'UP');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('memory_usage');
    expect(data).toHaveProperty('cpu_load');
    expect(data).toHaveProperty('backend_status');
  });

  it('should handle backend being down', async () => {
    global.fetch = jest.fn(() => Promise.reject('Network error')) as jest.Mock;
    
    const response = await GET();
    const data = await response.json();

    expect(data.backend_status).toBe('DOWN');
    expect(data.status).toBe('UP'); // Frontend is still up even if backend is down
  });
}); 