import { Blueprint } from '@/lib/blueprints'
import * as CopilotKitCore from '@copilotkit/react-core'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { ChatPanel } from '../chat-panel'
import { useInfraTools } from '../tools'

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
  useCopilotReadable: jest.fn(),
  useFrontendTool: jest.fn(),
  useHumanInTheLoop: jest.fn(),
}))

let capturedUserMessageComponent: React.ComponentType<{ message?: { id: string; content: string } }> | null = null
let capturedMessages: Array<{ id: string; content: string }> = []
let currentUserMessageComponent: React.ComponentType<{ message?: { id: string; content: string } }> | null = null

jest.mock('@copilotkit/react-ui', () => ({
  CopilotChat: ({ instructions, labels, UserMessage }: {
    instructions?: string
    labels?: { initial?: string }
    UserMessage?: React.ComponentType<{ message?: { id: string; content: string } }>
  }) => {
    if (UserMessage) {
      capturedUserMessageComponent = UserMessage
      currentUserMessageComponent = UserMessage
    }
    // Render UserMessage with captured messages to test the hiding logic
    // This simulates how CopilotChat would render messages
    const userMessageElements = capturedMessages.map((msg, idx) => {
      if (currentUserMessageComponent) {
        const result = React.createElement(currentUserMessageComponent, { key: idx, message: msg })
        // If result is null, the message was hidden (auto-start message)
        return result
      }
      return null
    }).filter((el) => el !== null)
    
    return React.createElement('div', { 'data-testid': 'copilot-chat' }, [
      React.createElement('div', { key: 'instructions', 'data-testid': 'instructions' }, instructions),
      labels?.initial &&
        React.createElement('div', { key: 'initial', 'data-testid': 'initial-label' }, labels.initial),
      UserMessage && React.createElement('div', { key: 'user-msg', 'data-testid': 'custom-user-message' }),
      ...userMessageElements,
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
    currentUserMessageComponent = null
    capturedMessages = []
    mockUseInfraTools.mockReturnValue(undefined)
    // Reset mock call count but keep the mock function
    mockSendMessage.mockClear()
    // Ensure useCopilotChatInternal returns the correct mock values
    ;(CopilotKitCore.useCopilotChatInternal as jest.Mock).mockReturnValue({
      sendMessage: (message: { id: string; content: string }) => {
        mockSendMessage(message)
        // Simulate the message being added to the chat
        capturedMessages.push(message)
      },
      isAvailable: true,
    })
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
    ;(CopilotKitCore.useCopilotChatInternal as jest.Mock).mockReturnValue({
      sendMessage: null,
      isAvailable: false,
    })
    render(<ChatPanel blueprint={mockBlueprint} />)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should handle CustomUserMessage hiding auto-start message (lines 57-65)', async () => {
    // Render ChatPanel - this will trigger auto-start and set autoStartMessageId.current
    render(<ChatPanel blueprint={mockBlueprint} />)
    
    // Wait for sendMessage to be called first - this sets autoStartMessageId.current
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled()
    }, { timeout: 2000 })
    
    // Wait for UserMessage component to be captured
    await waitFor(() => {
      expect(capturedUserMessageComponent).not.toBeNull()
    })
    
    if (!capturedUserMessageComponent) {
      throw new Error('capturedUserMessageComponent is null')
    }
    
    const sentMessage = mockSendMessage.mock.calls[0][0]
    const autoStartId = sentMessage.id
    expect(autoStartId).toMatch(/^auto-start-\d+$/)
    
    // Test line 58: destructure message from props
    // Test line 60-61: Matching message.id should return null (covers both conditions)
    // The CustomUserMessage component has closure access to autoStartMessageId.current from ChatPanel
    // We test by directly rendering the component with different messages
    // Since CustomUserMessage is captured from the ChatPanel instance, it has access to the same ref
    
    // Case 1: Matching message.id - should return null (message hidden)
    const matchingMessage = { id: autoStartId, content: 'Start building the infrastructure' }
    const MatchingComponent = () => {
      if (!currentUserMessageComponent) return null
      const Component = currentUserMessageComponent
      return <Component message={matchingMessage} />
    }
    const { container: container1, unmount: unmount1 } = render(<MatchingComponent />)
    // When message.id matches autoStartMessageId.current, component returns null (no content rendered)
    expect(container1.firstChild).toBeNull()
    unmount1()

    // Case 2: Non-matching message.id - should render DefaultUserMessage
    const nonMatchingMessage = { id: 'other-123', content: 'Regular message' }
    const NonMatchingComponent = () => {
      if (!currentUserMessageComponent) return null
      const Component = currentUserMessageComponent
      return <Component message={nonMatchingMessage} />
    }
    const { container: container2, unmount: unmount2 } = render(<NonMatchingComponent />)
    // Non-matching message should render DefaultUserMessage
    const defaultMessages2 = container2.querySelectorAll('[data-testid="default-user-message"]')
    expect(defaultMessages2.length).toBeGreaterThan(0)
    unmount2()

    // Case 3: Undefined message - should render (condition fails because message?.id is undefined)
    const UndefinedComponent = () => {
      if (!currentUserMessageComponent) return null
      const Component = currentUserMessageComponent
      return <Component message={undefined} />
    }
    const { container: container3, unmount: unmount3 } = render(<UndefinedComponent />)
    // When message is undefined, it should still render (condition fails)
    const defaultMessages3 = container3.querySelectorAll('[data-testid="default-user-message"]')
    expect(defaultMessages3.length).toBeGreaterThan(0)
    unmount3()
  })

  it('should return null when autoStartMessageId.current matches message.id (covers line 60-61 condition)', async () => {
    // Render ChatPanel to trigger auto-start and set autoStartMessageId.current
    render(<ChatPanel blueprint={mockBlueprint} />)
    
    // Wait for sendMessage to be called - this sets autoStartMessageId.current
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled()
    }, { timeout: 2000 })
    
    // Wait for UserMessage component to be captured
    await waitFor(() => {
      expect(capturedUserMessageComponent).not.toBeNull()
    })
    
    if (!capturedUserMessageComponent) {
      throw new Error('capturedUserMessageComponent is null')
    }
    
    const sentMessage = mockSendMessage.mock.calls[0][0]
    const autoStartId = sentMessage.id
    
    // Test the specific condition: if (autoStartMessageId.current && message?.id === autoStartMessageId.current)
    // Case 1: Both conditions true - autoStartMessageId.current is truthy AND message.id matches
    // This should return null (hide the message)
    const matchingMessage = { id: autoStartId, content: 'Start building the infrastructure' }
    const MatchingComponent = () => {
      if (!capturedUserMessageComponent) return null
      const Component = capturedUserMessageComponent
      return <Component message={matchingMessage} />
    }
    const { container } = render(<MatchingComponent />)
    // Verify that when message.id === autoStartMessageId.current, component returns null
    expect(container.firstChild).toBeNull()
    
    // Case 2: autoStartMessageId.current is truthy but message.id is different
    // This should NOT return null (render the message)
    const differentMessage = { id: 'different-id', content: 'Different message' }
    const DifferentComponent = () => {
      if (!capturedUserMessageComponent) return null
      const Component = capturedUserMessageComponent
      return <Component message={differentMessage} />
    }
    const { container: container2 } = render(<DifferentComponent />)
    expect(container2.firstChild).not.toBeNull()
    
    // Case 3: autoStartMessageId.current is truthy but message is undefined
    // This should NOT return null (message?.id is undefined, so condition fails)
    const UndefinedComponent = () => {
      if (!capturedUserMessageComponent) return null
      const Component = capturedUserMessageComponent
      return <Component message={undefined} />
    }
    const { container: container3 } = render(<UndefinedComponent />)
    expect(container3.firstChild).not.toBeNull()
    
    // Case 4: autoStartMessageId.current is truthy but message.id is undefined
    // This should NOT return null (message?.id is undefined, so condition fails)
    const MessageWithoutId = () => {
      if (!capturedUserMessageComponent) return null
      const Component = capturedUserMessageComponent
      return <Component message={{ content: 'No id' } as { id: string; content: string }} />
    }
    const { container: container4 } = render(<MessageWithoutId />)
    expect(container4.firstChild).not.toBeNull()
  })
})
