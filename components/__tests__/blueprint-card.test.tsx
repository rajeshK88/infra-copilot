import { Blueprint } from '@/lib/blueprints'
import { render, screen } from '@testing-library/react'
import { BlueprintCard } from '../blueprint-card'

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
  it('should render all blueprint information and link correctly', () => {
    render(<BlueprintCard blueprint={mockBlueprint} index={0} />)
    
    // Basic content
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('5 minutes')).toBeInTheDocument()
    expect(screen.getByText('$10/month')).toBeInTheDocument()
    expect(screen.getByText('Terraform')).toBeInTheDocument()
    expect(screen.getByText('View Blueprint')).toBeInTheDocument()
    
    // Link
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/blueprints/test-blueprint')
    
    // Cloud provider badge
    const awsElements = screen.getAllByText('AWS')
    expect(awsElements.length).toBeGreaterThan(0)
  })

  it('should apply correct theme based on cloud provider', () => {
    const testCases = [
      { provider: 'AWS', themeClass: 'from-orange' },
      { provider: 'Google Cloud', themeClass: 'from-blue' },
      { provider: 'Azure', themeClass: 'from-cyan' },
      { provider: 'Unknown Cloud', themeClass: 'from-purple' },
    ]

    testCases.forEach(({ provider, themeClass }) => {
      const { unmount } = render(
        <BlueprintCard blueprint={{ ...mockBlueprint, cloudProvider: provider }} index={0} />
      )
      const card = screen.getByText('Test Blueprint').closest('div')
      const parentCard = card?.closest(`[class*="${themeClass}"]`)
      expect(parentCard).toBeInTheDocument()
      unmount()
    })
  })
})

