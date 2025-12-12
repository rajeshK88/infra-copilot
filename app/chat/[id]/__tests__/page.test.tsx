import { render } from '@testing-library/react'
import ChatPage from '../page'
import { getBlueprintById } from '@/lib/blueprints'
import { Blueprint } from '@/lib/blueprints'

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

const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('notFound called')
  },
}))

const mockBlueprint = {
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
    mockNotFound.mockClear()
  })

  it('should render chat page with blueprint', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ id: '1' }),
    }
    const page = await ChatPage(props)
    const { container } = render(page)
    expect(container.querySelector('[data-testid="copilotkit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-runtime-url="/api/copilotkit"]')).toBeInTheDocument()
  })

  it('should call getBlueprintById with correct id', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ id: '1' }),
    }
    await ChatPage(props)
    expect(getBlueprintById).toHaveBeenCalledWith('1')
  })

  it('should handle blueprint not found and call notFound (line 15)', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(undefined)
    const props = {
      params: Promise.resolve({ id: '999' }),
    }
    try {
      await ChatPage(props)
      // If we reach here, notFound wasn't called - fail the test
      fail('Expected notFound to be called')
    } catch {
      // notFound throws an error - this is expected (line 15: notFound())
      expect(mockNotFound).toHaveBeenCalled()
    }
  })

  it('should handle blueprint not found with different id', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(undefined)
    const props = {
      params: Promise.resolve({ id: 'non-existent' }),
    }
    try {
      await ChatPage(props)
      fail('Expected notFound to be called')
    } catch {
      // Verify notFound was called when blueprint is not found
      expect(mockNotFound).toHaveBeenCalled()
    }
  })

  it('should call getBlueprintById with correct id when blueprint not found', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(undefined)
    const props = {
      params: Promise.resolve({ id: 'invalid-id' }),
    }
    try {
      await ChatPage(props)
      fail('Expected notFound to be called')
    } catch {
      // Verify getBlueprintById was called with the correct id
      expect(getBlueprintById).toHaveBeenCalledWith('invalid-id')
      expect(mockNotFound).toHaveBeenCalled()
    }
  })

  it('should handle blueprint not found with null value', async () => {
    ;(getBlueprintById as jest.Mock).mockReturnValue(null)
    const props = {
      params: Promise.resolve({ id: 'null-id' }),
    }
    try {
      await ChatPage(props)
      fail('Expected notFound to be called')
    } catch {
      // Verify notFound was called when blueprint is null
      expect(mockNotFound).toHaveBeenCalled()
      expect(getBlueprintById).toHaveBeenCalledWith('null-id')
    }
  })
})

