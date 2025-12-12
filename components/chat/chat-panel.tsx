'use client'

import { agentInstructions } from '@/lib/agent-instructions'
import { Blueprint } from '@/lib/blueprints'
import { useInfraStore } from '@/lib/store'
import { useCopilotChatInternal } from '@copilotkit/react-core'
import { CopilotChat, UserMessage as DefaultUserMessage, UserMessageProps } from '@copilotkit/react-ui'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useInfraTools } from './tools'

interface ChatPanelProps {
  blueprint: Blueprint
}

export const ChatPanel = ({ blueprint }: ChatPanelProps) => {
  // Reset store when new chat opens
  const resetStore = useInfraStore((state) => state.resetStore)
  useEffect(() => {
    resetStore()
  }, [resetStore, blueprint.id]) // Reset when blueprint.id changes (new chat)

  // Register all tools
  useInfraTools(blueprint)
  // Use useCopilotChatInternal to access sendMessage
  // Note: useCopilotChat omits sendMessage, so we use the internal hook
  const { sendMessage, isAvailable } = useCopilotChatInternal()
  const hasAutoStarted = useRef(false)
  const autoStartMessageId = useRef<string | null>(null)

  // Format steps for the tool call
  const stepsForTool = blueprint.steps.map((step, idx) => ({
    number: idx + 1,
    title: step.title,
    type: step.type,
  }))

  // Auto-start conversation on mount
  useEffect(() => {
    // Wait for both sendMessage to be available and agent to be ready
    if (!hasAutoStarted.current && sendMessage && isAvailable) {
      hasAutoStarted.current = true
      // Send a message to trigger the AI to start
      setTimeout(() => {
        const messageId = `auto-start-${Date.now()}`
        autoStartMessageId.current = messageId
        sendMessage({
          id: messageId,
          role: 'user',
          content: 'Start building the infrastructure',
        })
      }, 1000) // Delay to ensure CopilotChat is fully ready
    }
  }, [sendMessage, isAvailable])

  // Custom UserMessage component to hide the auto-start message
  const CustomUserMessage = (props: UserMessageProps) => {
    const { message } = props
    // Hide the auto-start message
    if (autoStartMessageId.current && message?.id === autoStartMessageId.current) {
      return null
    }
    // For other messages, use default rendering
    return <DefaultUserMessage {...props} />
  }

  const instructions = `${agentInstructions}

## Current Blueprint Context
- Blueprint Name: ${blueprint.name}
- Description: ${blueprint.description}
- Cloud Provider: ${blueprint.cloudProvider}
- Technologies: ${blueprint.technologies.join(', ')}
- Total Steps: ${blueprint.steps.length}

## Blueprint Steps (Use this EXACT data for displayStepsList tool call)
${blueprint.steps.map((step, idx) => `${idx + 1}. ${step.title} (${step.type})`).join('\n')}

## YOUR FIRST ACTION (DO THIS IMMEDIATELY)
Call displayStepsList with this exact data:
\`\`\`json
{
  "steps": ${JSON.stringify(stepsForTool)}
}
\`\`\`

After calling displayStepsList, immediately call the requestStepConfirmation TOOL (not just ask verbally) for Step 1.

CRITICAL: When asking for user permission, you MUST call the requestStepConfirmation tool. Do NOT just ask "Would you like to start with Step X?" - you MUST actually call the tool which will show a confirmation card with buttons.

Remember to execute these steps one at a time, calling requestStepConfirmation tool before each step.

**CRITICAL: Continue through ALL ${blueprint.steps.length} steps. Do NOT stop after step 2 or 3. After each markStepComplete, IMMEDIATELY call requestStepConfirmation for the next step until all steps are complete.**`

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{blueprint.name}</h2>
            <p className="text-xs text-slate-400 truncate">{blueprint.cloudProvider}</p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CopilotChat
          instructions={instructions}
          labels={{
            // No initial message - will be hidden
            initial: undefined,
          }}
          UserMessage={CustomUserMessage}
        />
      </div>
    </div>
  )
}

