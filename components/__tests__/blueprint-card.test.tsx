import { render, screen } from '@testing-library/react'
import { BlueprintCard } from '../blueprint-card'
import { Blueprint } from '@/lib/blueprints'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
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
  steps: [],
}

describe('BlueprintCard', () => {
  it('should render blueprint name', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
  })

  it('should render blueprint description', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render cloud provider badge', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    const awsElements = screen.getAllByText('AWS')
    expect(awsElements.length).toBeGreaterThan(0)
  })

  it('should render setup time', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('5 minutes')).toBeInTheDocument()
  })

  it('should render cost', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('$10/month')).toBeInTheDocument()
  })

  it('should render technologies', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('Terraform')).toBeInTheDocument()
    // AWS appears multiple times (badge and technology), so use getAllByText
    const awsElements = screen.getAllByText('AWS')
    expect(awsElements.length).toBeGreaterThan(0)
  })

  it('should render link to blueprint detail page', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/blueprints/test-blueprint')
  })

  it('should render CTA button', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    expect(screen.getByText('View Blueprint')).toBeInTheDocument()
  })

  it('should apply AWS theme for AWS provider', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    const card = screen.getByText('Test Blueprint').closest('div')
    // Check parent container for theme classes
    const parentCard = card?.closest('[class*="from-orange"]')
    expect(parentCard).toBeInTheDocument()
  })

  it('should apply Google Cloud theme for GCP provider', () => {
    const gcpBlueprint = { ...mockBlueprint, cloudProvider: 'Google Cloud' }
    render(<BlueprintCard blueprint={gcpBlueprint} index={0} />)
    const card = screen.getByText('Test Blueprint').closest('div')
    // Check parent container for theme classes
    const parentCard = card?.closest('[class*="from-blue"]')
    expect(parentCard).toBeInTheDocument()
  })

  it('should apply Azure theme for Azure provider', () => {
    const azureBlueprint = { ...mockBlueprint, cloudProvider: 'Azure' }
    render(<BlueprintCard blueprint={azureBlueprint} index={0} />)
    const card = screen.getByText('Test Blueprint').closest('div')
    const parentCard = card?.closest('[class*="from-cyan"]')
    expect(parentCard).toBeInTheDocument()
  })

  it('should apply default theme for unknown provider', () => {
    const unknownBlueprint = { ...mockBlueprint, cloudProvider: 'Unknown Cloud' }
    render(<BlueprintCard blueprint={unknownBlueprint} index={0} />)
    const card = screen.getByText('Test Blueprint').closest('div')
    const parentCard = card?.closest('[class*="from-purple"]')
    expect(parentCard).toBeInTheDocument()
  })
})

