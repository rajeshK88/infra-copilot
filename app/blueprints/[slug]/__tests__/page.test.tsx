import { render, screen } from '@testing-library/react'
import BlueprintPage from '../page'
import { getBlueprintBySlug } from '@/lib/blueprints'

jest.mock('@/lib/blueprints', () => ({
  getBlueprintBySlug: jest.fn(),
}))

import { Blueprint } from '@/lib/blueprints'

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

const mockBlueprint = {
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
  it('should render blueprint detail when blueprint exists', async () => {
    ;(getBlueprintBySlug as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ slug: 'test-blueprint' }),
    }
    const page = await BlueprintPage(props)
    const { container } = render(page)
    expect(container.querySelector('[data-testid="blueprint-detail"]')).toBeInTheDocument()
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
  })

  it('should call getBlueprintBySlug with correct slug', async () => {
    ;(getBlueprintBySlug as jest.Mock).mockReturnValue(mockBlueprint)
    const props = {
      params: Promise.resolve({ slug: 'test-blueprint' }),
    }
    await BlueprintPage(props)
    expect(getBlueprintBySlug).toHaveBeenCalledWith('test-blueprint')
  })

  it('should call notFound when blueprint does not exist', async () => {
    const { notFound } = await import('next/navigation')
    ;(getBlueprintBySlug as jest.Mock).mockReturnValue(undefined)
    const props = {
      params: Promise.resolve({ slug: 'non-existent' }),
    }
    await expect(BlueprintPage(props)).rejects.toThrow('not-found')
    expect(notFound).toHaveBeenCalled()
  })
})


