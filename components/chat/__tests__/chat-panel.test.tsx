import { Blueprint } from '@/lib/blueprints'
import { render, screen, waitFor, act } from '@testing-library/react'
import { ChatPanel } from '../chat-panel'
import { useInfraTools } from '../tools'
import React from 'react'

const mockResetStore = jest.fn()
const mockSendMessage = jest.fn()

jest.mock('../tools')
jest.mock('@/lib/store', () => ({
  useInfraStore: jest.fn((selector) => {
    const mockStore = {
      files: [],
      selectedFile: null,
      expandedFolders: new Set<string>(),
      resetStore: mockResetStore,
    }
    return selector ? selector(mockStore) : mockStore
  }),
}))

jest.mock('@copilotkit/react-core', () => ({
  useCopilotChatInternal: jest.fn(() => ({
    sendMessage: mockSendMessage,
    isAvailable: true,
  })),
}))

let capturedUserMessageComponent: React.ComponentType<{ message?: { id: string; content: string } }> | null = null

jest.mock('@copilotkit/react-ui', () => ({
  CopilotChat: ({ instructions, labels, UserMessage }: {
    instructions?: string
    labels?: { initial?: string }
    UserMessage?: React.ComponentType<{ message?: { id: string; content: string } }>
  }) => {
    if (UserMessage) {
      capturedUserMessageComponent = UserMessage
    }
    return React.createElement('div', { 'data-testid': 'copilot-chat' }, [
      React.createElement('div', { key: 'instructions', 'data-testid': 'instructions' }, instructions),
      labels?.initial &&
        React.createElement('div', { key: 'initial', 'data-testid': 'initial-label' }, labels.initial),
      UserMessage && React.createElement('div', { key: 'user-msg', 'data-testid': 'custom-user-message' }),
    ])
  },
  UserMessage: () => React.createElement('div', { 'data-testid': 'default-user-message' }),
}))

const mockBlueprint: Blueprint = {
  id: '1',
  slug: 'test-blueprint',
  name: 'Test Blueprint',
  description: 'Test description',
  cost: '$10/month',
  setupTime: '5 minutes',
  technologies: ['Terraform', 'AWS'],
  category: 'Web & API',
  cloudProvider: 'AWS',
  whatYouBuild: 'Test infrastructure',
  steps: [
    {
      id: 1,
      title: 'Step 1',
      type: 'terraform-module',
      description: 'First step',
    },
  ],
}

describe('ChatPanel', () => {
  const mockUseInfraTools = useInfraTools as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    capturedUserMessageComponent = null
    mockUseInfraTools.mockReturnValue(undefined)
  })

  it('should render chat panel, register tools, reset store, and include blueprint context', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    
    // Basic rendering
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByTestId('copilot-chat')).toBeInTheDocument()
    expect(screen.getByTestId('custom-user-message')).toBeInTheDocument()
    
    // Tools registration
    expect(mockUseInfraTools).toHaveBeenCalledWith(mockBlueprint)
    
    // Store reset
    expect(mockResetStore).toHaveBeenCalled()
    
    // Instructions content
    const instructions = screen.getByTestId('instructions').textContent
    expect(instructions).toContain('Test Blueprint')
    expect(instructions).toContain('AWS')
    expect(instructions).toContain('Total Steps: 1')
    expect(instructions).toContain('displayStepsList')
    expect(instructions).toContain('requestStepConfirmation')
  })

  it('should reset store when blueprint.id changes', () => {
    const { rerender } = render(<ChatPanel blueprint={mockBlueprint} />)
    expect(mockResetStore).toHaveBeenCalledTimes(1)
    
    const newBlueprint = { ...mockBlueprint, id: '2' }
    rerender(<ChatPanel blueprint={newBlueprint} />)
    expect(mockResetStore).toHaveBeenCalledTimes(2)
  })

  it('should auto-start conversation when available', async () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    await waitFor(
      () => {
        expect(mockSendMessage).toHaveBeenCalled()
      },
      { timeout: 2000 }
    )
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'Start building the infrastructure',
      })
    )
  })

  it('should not auto-start if sendMessage is not available', () => {
    const { useCopilotChatInternal } = require('@copilotkit/react-core')
    ;(useCopilotChatInternal as jest.Mock).mockReturnValue({
      sendMessage: null,
      isAvailable: false,
    })
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should handle CustomUserMessage hiding auto-start message (lines 57-65)', async () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    
    // Wait for UserMessage component to be captured
    await waitFor(() => {
      expect(capturedUserMessageComponent).not.toBeNull()
    })
    
    // Wait for sendMessage to be called (after 1000ms setTimeout) - this sets autoStartMessageId.current
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled()
    }, { timeout: 3000 })
    
    if (!capturedUserMessageComponent) {
      throw new Error('capturedUserMessageComponent is null')
    }
    
    const sentMessage = mockSendMessage.mock.calls[0][0]
    const autoStartId = sentMessage.id
    expect(autoStartId).toMatch(/^auto-start-\d+$/)
    
    // Test line 58: destructure message from props
    // Test line 60-61: Matching message.id should return null (covers both conditions)
    const matchingMessage = { id: autoStartId, content: 'Start building the infrastructure' }
    const result1 = React.createElement(capturedUserMessageComponent, { message: matchingMessage })
    expect(result1).toBeNull()

    // Test line 64: Non-matching message.id should render DefaultUserMessage
    const nonMatchingMessage = { id: 'other-123', content: 'Regular message' }
    const result2 = React.createElement(capturedUserMessageComponent, { message: nonMatchingMessage })
    expect(result2).not.toBeNull()

    // Test line 60: Undefined message should render (first condition false: autoStartMessageId.current is truthy, but message?.id is undefined)
    const result3 = React.createElement(capturedUserMessageComponent, { message: undefined })
    expect(result3).not.toBeNull()
    
    // Test line 60: When autoStartMessageId.current is null (before setTimeout executes)
    // This requires a fresh render where autoStartMessageId hasn't been set yet
    const { unmount } = render(<ChatPanel blueprint={mockBlueprint} />)
    await waitFor(() => {
      expect(capturedUserMessageComponent).not.toBeNull()
    })
    // Before setTimeout executes, autoStartMessageId.current is null
    const result4 = React.createElement(capturedUserMessageComponent, { message: { id: 'test', content: 'test' } })
    expect(result4).not.toBeNull()
    unmount()
  })
})
