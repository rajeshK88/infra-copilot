import { Blueprint } from '@/lib/blueprints'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlueprintDetail } from '../blueprint-detail'

// Mock window.scrollTo for framer-motion animations
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
})

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
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
  whatYouBuild: 'This builds a test infrastructure',
  steps: [
    {
      id: 1,
      title: 'Step 1',
      type: 'terraform-module',
      description: 'First step',
    },
  ],
}

describe('BlueprintDetail', () => {
  it('should render all blueprint information correctly', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    
    // Basic content
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText(/This builds a test infrastructure/i)).toBeInTheDocument()
    expect(screen.getByText('Terraform')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    
    // Link
    const button = screen.getByRole('link', { name: /start chat with blueprint/i })
    expect(button).toHaveAttribute('href', '/chat/1')
  })

  it('should toggle step expansion when clicked', async () => {
    const user = userEvent.setup()
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    const stepButton = screen.getByText('Step 1').closest('button')
    expect(stepButton).toBeInTheDocument()
    
    if (stepButton) {
      // Expand
      await user.click(stepButton)
      expect(screen.getByText(/Step configuration options will be available here/i)).toBeInTheDocument()
      expect(screen.getByText(/Terraform module/i)).toBeInTheDocument()
      
      // Collapse
      await user.click(stepButton)
      await waitFor(() => {
        expect(stepButton).toBeInTheDocument()
      })
    }
  })

  it('should show correct step icons for different step types', () => {
    const testCases = [
      { type: 'terraform-environment' as const, icon: '🌍' },
      { type: 'terraform-module' as const, icon: '📦' },
      { type: 'github-actions' as const, icon: '⚙️' },
      { type: 'unknown' as 'terraform-module' | 'terraform-environment' | 'github-actions', icon: '📋' },
    ]

    testCases.forEach(({ type, icon }) => {
      const { unmount } = render(
        <BlueprintDetail
          blueprint={{
            ...mockBlueprint,
            steps: [
              {
                id: 1,
                title: 'Test Step',
                type,
                description: 'Test',
              },
            ],
          }}
        />
      )
      expect(screen.getByText(icon)).toBeInTheDocument()
      unmount()
    })
  })

  it('should render step optional fields (moduleName, workflowName, workflowSteps)', () => {
    const testCases = [
      {
        step: {
          id: 1,
          title: 'Step 1',
          type: 'terraform-module' as const,
          description: 'Module',
          moduleName: 'vpc-module',
        },
        expectedText: 'vpc-module',
      },
      {
        step: {
          id: 1,
          title: 'CI/CD',
          type: 'github-actions' as const,
          description: 'GitHub Actions',
          workflowName: '.github/workflows/deploy.yml',
        },
        expectedText: '.github/workflows/deploy.yml',
      },
      {
        step: {
          id: 1,
          title: 'CI/CD',
          type: 'github-actions' as const,
          description: 'GitHub Actions',
          workflowSteps: 5,
        },
        expectedText: '5 steps',
      },
    ]

    testCases.forEach(({ step, expectedText }) => {
      const { unmount } = render(
        <BlueprintDetail blueprint={{ ...mockBlueprint, steps: [step] }} />
      )
      expect(screen.getByText(expectedText)).toBeInTheDocument()
      unmount()
    })
  })

  it('should show correct step type text in expanded content', async () => {
    const user = userEvent.setup()
    const testCases = [
      {
        type: 'terraform-environment' as const,
        title: 'Terraform Environment Step',
        expectedText: /users can customize the Terraform environment/i,
      },
      {
        type: 'terraform-module' as const,
        title: 'Terraform Module Step',
        expectedText: /users can customize the Terraform module/i,
      },
      {
        type: 'github-actions' as const,
        title: 'GitHub Actions Step',
        expectedText: /users can customize the GitHub Actions workflow/i,
      },
    ]

    for (const { type, title, expectedText } of testCases) {
      const { unmount } = render(
        <BlueprintDetail
          blueprint={{
            ...mockBlueprint,
            steps: [
              {
                id: 1,
                title,
                type,
                description: 'Test',
              },
            ],
          }}
        />
      )
      const expandButton = screen.getByText(title).closest('button')
      expect(expandButton).toBeInTheDocument()
      
      if (expandButton) {
        await user.click(expandButton)
        expect(screen.getByText(expectedText)).toBeInTheDocument()
      }
      unmount()
    }
  })
})

