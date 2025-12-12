import { Blueprint, getBlueprintBySlug } from '@/lib/blueprints'
import { render, screen } from '@testing-library/react'
import BlueprintPage from '../page'

jest.mock('@/lib/blueprints', () => ({
  getBlueprintBySlug: jest.fn(),
}))

jest.mock('@/components/blueprint-detail', () => ({
  BlueprintDetail: ({ blueprint }: { blueprint: Blueprint }) => (
    <div data-testid="blueprint-detail">{blueprint.name}</div>
  ),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('not-found')
  }),
}))

const mockBlueprint: Blueprint = {
  id: '1',
  slug: 'test-blueprint',
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

describe('BlueprintPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render blueprint detail and call getBlueprintBySlug with correct slug', async () => {
    ;(getBlueprintBySlug as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ slug: 'test-blueprint' }),
    }
    const page = await BlueprintPage(props)
    const { container } = render(page)
    
    expect(getBlueprintBySlug).toHaveBeenCalledWith('test-blueprint')
    expect(container.querySelector('[data-testid="blueprint-detail"]')).toBeInTheDocument()
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
  })

  it('should call notFound when blueprint does not exist', async () => {
    ;(getBlueprintBySlug as jest.Mock).mockReturnValue(undefined)
    const props = {
      params: Promise.resolve({ slug: 'non-existent' }),
    }
    
    await expect(BlueprintPage(props)).rejects.toThrow('not-found')
  })
})


