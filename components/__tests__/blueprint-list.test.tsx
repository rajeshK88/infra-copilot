import { render, screen } from '@testing-library/react'
import { BlueprintList } from '../blueprint-list'
import { Blueprint } from '@/lib/blueprints'

jest.mock('../blueprint-card', () => ({
  BlueprintCard: ({ blueprint }: { blueprint: Blueprint }) => (
    <div data-testid="blueprint-card">{blueprint.name}</div>
  ),
}))

const mockBlueprints: Blueprint[] = [
  {
    id: '1',
    slug: 'blueprint-1',
    name: 'Blueprint 1',
    description: 'Description 1',
    cost: '$10',
    setupTime: '5 min',
    technologies: ['Terraform'],
    category: 'Web',
    cloudProvider: 'AWS',
    whatYouBuild: 'Test',
    steps: [],
  },
  {
    id: '2',
    slug: 'blueprint-2',
    name: 'Blueprint 2',
    description: 'Description 2',
    cost: '$20',
    setupTime: '10 min',
    technologies: ['Kubernetes'],
    category: 'Web',
    cloudProvider: 'GCP',
    whatYouBuild: 'Test',
    steps: [],
  },
]

describe('BlueprintList', () => {
  it('should render all blueprints', () => {
    render(<BlueprintList blueprints={mockBlueprints} />)
    expect(screen.getByText('Blueprint 1')).toBeInTheDocument()
    expect(screen.getByText('Blueprint 2')).toBeInTheDocument()
  })

  it('should render correct number of blueprint cards', () => {
    render(<BlueprintList blueprints={mockBlueprints} />)
    const cards = screen.getAllByTestId('blueprint-card')
    expect(cards).toHaveLength(2)
  })

  it('should render empty state when no blueprints', () => {
    render(<BlueprintList blueprints={[]} />)
    const cards = screen.queryAllByTestId('blueprint-card')
    expect(cards).toHaveLength(0)
  })
})

