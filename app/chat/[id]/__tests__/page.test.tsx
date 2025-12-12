import { Blueprint, getBlueprintById } from '@/lib/blueprints'
import { render } from '@testing-library/react'
import ChatPage from '../page'

jest.mock('@/lib/blueprints', () => ({
  getBlueprintById: jest.fn(),
}))

jest.mock('@copilotkit/react-core', () => ({
  CopilotKit: ({ children, runtimeUrl }: { children: React.ReactNode; runtimeUrl: string }) => (
    <div data-testid="copilotkit" data-runtime-url={runtimeUrl}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ blueprint }: { blueprint: Blueprint }) => (
    <div data-testid="main-layout">{blueprint.name}</div>
  ),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound called')
  }),
}))

const mockBlueprint: Blueprint = {
  id: '1',
  slug: 'test',
  name: 'Test Blueprint',
  description: 'Test',
  cost: '$10',
  setupTime: '5 min',
  technologies: [],
  category: 'Web',
  cloudProvider: 'AWS',
  whatYouBuild: 'Test',
  steps: [],
}

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render chat page with blueprint and call getBlueprintById with correct id', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ id: '1' }),
    }
    const page = await ChatPage(props)
    const { container } = render(page)
    
    expect(getBlueprintById).toHaveBeenCalledWith('1')
    expect(container.querySelector('[data-testid="copilotkit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-runtime-url="/api/copilotkit"]')).toBeInTheDocument()
  })

  it('should call notFound when blueprint does not exist (undefined or null)', async () => {
    const { notFound } = await import('next/navigation')
    const testCases = [
      { id: '999', blueprint: undefined },
      { id: 'null-id', blueprint: null },
    ]

    for (const { id, blueprint } of testCases) {
      ;(getBlueprintById as jest.Mock).mockReturnValue(blueprint)
      const props = {
        params: Promise.resolve({ id }),
      }
      
      await expect(ChatPage(props)).rejects.toThrow('notFound called')
      expect(getBlueprintById).toHaveBeenCalledWith(id)
      expect(notFound).toHaveBeenCalled()
      jest.clearAllMocks()
    }
  })
})
