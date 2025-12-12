import { render, screen } from '@testing-library/react'
import HomePage from '../page'
import { getAllBlueprints } from '@/lib/blueprints'

jest.mock('@/lib/blueprints', () => ({
  getAllBlueprints: jest.fn(),
}))

jest.mock('@/components/blueprint-list', () => ({
  BlueprintList: ({ blueprints }: { blueprints: Array<{ id: string }> }) => (
    <div data-testid="blueprint-list">{blueprints.length} blueprints</div>
  ),
}))

const mockBlueprint = {
  id: '1',
  slug: 'test',
  name: 'Test',
  description: 'Test',
  cost: '$10',
  setupTime: '5 min',
  technologies: [],
  category: 'Web',
  cloudProvider: 'AWS',
  whatYouBuild: 'Test',
  steps: [],
}

describe('HomePage', () => {
  beforeEach(() => {
    ;(getAllBlueprints as jest.Mock).mockReturnValue([mockBlueprint])
  })

  it('should render all page sections', () => {
    render(<HomePage />)
    expect(screen.getByText('Infra Copilot')).toBeInTheDocument()
    expect(screen.getByText('Blueprints')).toBeInTheDocument()
    expect(screen.getByText(/Production-ready/i)).toBeInTheDocument()
    expect(screen.getByText(/infrastructure in minutes/i)).toBeInTheDocument()
    expect(screen.getByTestId('blueprint-list')).toBeInTheDocument()
  })
})

