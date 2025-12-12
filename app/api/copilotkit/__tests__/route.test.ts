if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: unknown
    status: number
    statusText: string
    headers: Headers
    constructor(body?: unknown, init?: { status?: number; statusText?: string; headers?: HeadersInit }) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers)
    }
  } as typeof Response
}

const mockHandleRequest = jest.fn(() => Promise.resolve(new Response('OK')))

jest.mock('@copilotkit/runtime', () => ({
  CopilotRuntime: jest.fn(),
  OpenAIAdapter: jest.fn(() => ({})),
  copilotRuntimeNextJSAppRouterEndpoint: jest.fn(() => ({ handleRequest: mockHandleRequest })),
}))

jest.mock('next/server', () => ({
  NextRequest: class {
    url: string
    method: string
    body?: unknown
    headers: Headers
    constructor(url: string, init?: { method?: string; body?: unknown; headers?: HeadersInit }) {
      this.url = url
      this.method = init?.method || 'GET'
      this.body = init?.body
      this.headers = new Headers(init?.headers)
    }
  },
}))

import { NextRequest } from 'next/server'
import { POST } from '../route'

describe('POST /api/copilotkit', () => {
  const createRequest = (overrides?: { method?: string; body?: string }) =>
    new NextRequest('http://localhost:3000/api/copilotkit', {
      method: 'POST',
      ...overrides,
    })

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key'
    mockHandleRequest.mockClear()
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('should handle POST request and call handleRequest', async () => {
    const req = createRequest({ body: JSON.stringify({ message: 'test' }) })
    const response = await POST(req)
    expect(response).toBeInstanceOf(Response)
    expect(mockHandleRequest).toHaveBeenCalledWith(req)
  })
})
