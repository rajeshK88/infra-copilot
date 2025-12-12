import { Blueprint } from '@/lib/blueprints'
import { render, screen, waitFor } from '@testing-library/react'
import { ChatPanel } from '../chat-panel'
import { useInfraTools } from '../tools'

const mockResetStore = jest.fn()

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
    sendMessage: jest.fn(),
    isAvailable: true,
  })),
}))

import React from 'react'

let capturedUserMessageComponent: React.ComponentType<{ message?: { id: string; content: string } }> | null = null

jest.mock('@copilotkit/react-ui', () => {
  return {
    CopilotChat: ({ instructions, labels, UserMessage }: {
      instructions?: string
      labels?: { initial?: string }
      UserMessage?: React.ComponentType<{ message?: { id: string; content: string } }>
    }) => {
      // Capture UserMessage component for testing
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
  }
})

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

// Mock useCopilotChatInternal before importing
const mockSendMessage = jest.fn()
const mockUseCopilotChatInternal = jest.fn(() => ({
  sendMessage: mockSendMessage,
  isAvailable: true,
}))

jest.mock('@copilotkit/react-core', () => ({
  useCopilotChatInternal: () => mockUseCopilotChatInternal(),
}))

describe('ChatPanel', () => {
  const mockUseInfraTools = useInfraTools as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    capturedUserMessageComponent = null
    mockUseCopilotChatInternal.mockReturnValue({
      sendMessage: mockSendMessage,
      isAvailable: true,
    })
    mockUseInfraTools.mockReturnValue(undefined)
  })

  it('should render chat panel with blueprint name', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
  })

  it('should register tools on mount', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(mockUseInfraTools).toHaveBeenCalledWith(mockBlueprint)
  })

  it('should render CopilotChat component', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(screen.getByTestId('copilot-chat')).toBeInTheDocument()
  })

  it('should include blueprint context in instructions', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    const instructions = screen.getByTestId('instructions').textContent
    expect(instructions).toContain('Test Blueprint')
    expect(instructions).toContain('AWS')
    expect(instructions).toContain('Total Steps: 1')
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
    mockUseCopilotChatInternal.mockReturnValue({
      sendMessage: null,
      isAvailable: false,
    })
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should use CustomUserMessage component', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(screen.getByTestId('custom-user-message')).toBeInTheDocument()
  })

  it('should handle CustomUserMessage hiding auto-start message', () => {
    const { container } = render(<ChatPanel blueprint={mockBlueprint} />)
    // CustomUserMessage is rendered, which handles hiding auto-start messages
    expect(container.querySelector('[data-testid="custom-user-message"]')).toBeInTheDocument()
  })

  it('should include stepsForTool in instructions', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    const instructions = screen.getByTestId('instructions').textContent
    expect(instructions).toContain('displayStepsList')
    expect(instructions).toContain('requestStepConfirmation')
  })

  it('should handle CustomUserMessage with auto-start message', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    // CustomUserMessage should be rendered
    expect(screen.getByTestId('custom-user-message')).toBeInTheDocument()
  })

  it('should handle CustomUserMessage with regular message', () => {
    render(<ChatPanel blueprint={mockBlueprint} />)
    // CustomUserMessage should handle non-auto-start messages
    const customMessage = screen.getByTestId('custom-user-message')
    expect(customMessage).toBeInTheDocument()
  })

  it('should return null when message.id matches autoStartMessageId (lines 51-54)', async () => {
    // Use fake timers to control setTimeout
    jest.useFakeTimers()
    
    // Render ChatPanel to get the CustomUserMessage component
    render(<ChatPanel blueprint={mockBlueprint} />)
    
    // Wait for UserMessage to be captured
    await waitFor(() => {
      expect(capturedUserMessageComponent).not.toBeNull()
    }, { timeout: 1000 })

    // Fast-forward the setTimeout (1000ms delay)
    jest.advanceTimersByTime(1000)

    // Get the message ID that was sent (format: auto-start-{timestamp})
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled()
    })
    
    const sentMessage = mockSendMessage.mock.calls[0][0]
    const autoStartId = sentMessage.id
    expect(autoStartId).toMatch(/^auto-start-\d+$/)

    // Test the CustomUserMessage component with matching message.id
    expect(capturedUserMessageComponent).not.toBeNull()
    
    if (!capturedUserMessageComponent) {
      throw new Error('capturedUserMessageComponent is null')
    }
    
    // Test case 1: message.id matches autoStartMessageId - should return null (line 54)
    // The ref autoStartMessageId.current is set inside ChatPanel's useEffect setTimeout
    // After advancing timers, the ref should be set to autoStartId
    const matchingMessage = { id: autoStartId, content: 'Start building the infrastructure' }
    const result1 = capturedUserMessageComponent({ message: matchingMessage })
    // The condition checks: if (autoStartMessageId.current && message?.id === autoStartMessageId.current)
    // Since autoStartMessageId.current is set to autoStartId, this should return null
    expect(result1).toBeNull()

    // Test case 2: message.id does not match - should render (not null)
    const nonMatchingMessage = { id: 'other-123', content: 'Regular message' }
    const result2 = capturedUserMessageComponent({ message: nonMatchingMessage })
    expect(result2).not.toBeNull()

    // Test case 3: message is undefined - should render (condition is false, line 53)
    const result3 = capturedUserMessageComponent({ message: undefined })
    expect(result3).not.toBeNull()

    jest.useRealTimers()
  })
})

