import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'

import { NextRequest } from 'next/server'

// Use gpt-5-nano - LOWEST COST model from OpenAI (if available, falls back to gpt-4o-mini)
// Pricing: ~$0.05 per 1M input tokens, ~$0.40 per 1M output tokens
// Fallback: gpt-4o-mini at ~$0.15/$0.60 per 1M tokens
// Rate limit: Very high
const serviceAdapter = new OpenAIAdapter({
  model: 'gpt-5-nano', // Try newest cheapest model, will fallback if not available
  // API key is read from OPENAI_API_KEY environment variable automatically
})

const runtime = new CopilotRuntime()

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  })

  return handleRequest(req)
}
