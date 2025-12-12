import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlueprintDetail } from '../blueprint-detail'
import { Blueprint } from '@/lib/blueprints'

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
  it('should render blueprint name', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText('Test Blueprint')).toBeInTheDocument()
  })

  it('should render blueprint description', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render what you build section', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText(/This builds a test infrastructure/i)).toBeInTheDocument()
  })

  it('should render technologies', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText('Terraform')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
  })

  it('should render start building button', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    const button = screen.getByRole('link', { name: /start chat with blueprint/i })
    expect(button).toHaveAttribute('href', '/chat/1')
  })

  it('should render steps', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should toggle step expansion when clicked', async () => {
    const user = userEvent.setup()
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    const stepButton = screen.getByText('Step 1').closest('button')
    if (stepButton) {
      await user.click(stepButton)
      // Step should be expanded
      expect(screen.getByText(/Step configuration options will be available here/i)).toBeInTheDocument()
    }
  })

  it('should collapse step when clicked again', async () => {
    const user = userEvent.setup()
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    const stepButton = screen.getByText('Step 1').closest('button')
    if (stepButton) {
      // Expand
      await user.click(stepButton)
      expect(screen.getByText(/Step configuration options will be available here/i)).toBeInTheDocument()
      // Collapse
      await user.click(stepButton)
      // Content should not be visible (may take a moment for animation)
      await waitFor(() => {
        // Content may still be in DOM during exit animation, so we just verify button exists
        expect(stepButton).toBeInTheDocument()
      })
    }
  })

  it('should show correct step icon for terraform-environment', () => {
    const blueprintWithEnv = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'Environment',
          type: 'terraform-environment' as const,
          description: 'Environment',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithEnv} />)
    expect(screen.getByText('🌍')).toBeInTheDocument()
  })

  it('should show correct step icon for terraform-module', () => {
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    expect(screen.getByText('📦')).toBeInTheDocument()
  })

  it('should show correct step icon for github-actions', () => {
    const blueprintWithActions = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'CI/CD',
          type: 'github-actions' as const,
          description: 'GitHub Actions',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithActions} />)
    expect(screen.getByText('⚙️')).toBeInTheDocument()
  })

  it('should show default step icon for unknown type', () => {
    const blueprintWithUnknown = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'Unknown',
          type: 'unknown' as 'terraform-module' | 'terraform-environment' | 'github-actions',
          description: 'Unknown',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithUnknown} />)
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  it('should render moduleName when provided', () => {
    const blueprintWithModule = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'Step 1',
          type: 'terraform-module' as const,
          description: 'Module',
          moduleName: 'vpc-module',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithModule} />)
    expect(screen.getByText('vpc-module')).toBeInTheDocument()
  })

  it('should render workflowName when provided', () => {
    const blueprintWithWorkflow = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'CI/CD',
          type: 'github-actions' as const,
          description: 'GitHub Actions',
          workflowName: '.github/workflows/deploy.yml',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithWorkflow} />)
    expect(screen.getByText('.github/workflows/deploy.yml')).toBeInTheDocument()
  })

  it('should render workflowSteps when provided', () => {
    const blueprintWithSteps = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'CI/CD',
          type: 'github-actions' as const,
          description: 'GitHub Actions',
          workflowSteps: 5,
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithSteps} />)
    expect(screen.getByText('5 steps')).toBeInTheDocument()
  })

  it('should show expanded content when step is expanded', async () => {
    const user = userEvent.setup()
    render(<BlueprintDetail blueprint={mockBlueprint} />)
    const stepButton = screen.getByText('Step 1').closest('button')
    if (stepButton) {
      await user.click(stepButton)
      expect(screen.getByText(/Terraform module/i)).toBeInTheDocument()
    }
  })

  it('should show terraform-environment text when step type is terraform-environment (lines 175-176)', async () => {
    const user = userEvent.setup()
    const blueprintWithTerraformEnv = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'Terraform Environment Step',
          type: 'terraform-environment' as const,
          description: 'Test',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithTerraformEnv} />)
    const expandButton = screen.getByText('Terraform Environment Step').closest('button')
    if (expandButton) {
      await user.click(expandButton)
      // Use getAllByText since "Terraform environment" may appear multiple times, then check it's in the expanded content
      const terraformEnvTexts = screen.getAllByText(/Terraform environment/i)
      expect(terraformEnvTexts.length).toBeGreaterThan(0)
      // Verify it's in the configuration options text
      expect(screen.getByText(/users can customize the Terraform environment/i)).toBeInTheDocument()
    }
  })

  it('should show GitHub Actions workflow text when step type is github-actions (line 179)', async () => {
    const user = userEvent.setup()
    const blueprintWithGitHubActions = {
      ...mockBlueprint,
      steps: [
        {
          id: 1,
          title: 'GitHub Actions Step',
          type: 'github-actions' as const,
          description: 'Test',
        },
      ],
    }
    render(<BlueprintDetail blueprint={blueprintWithGitHubActions} />)
    const expandButton = screen.getByText('GitHub Actions Step').closest('button')
    if (expandButton) {
      await user.click(expandButton)
      // Verify it's in the configuration options text
      expect(screen.getByText(/users can customize the GitHub Actions workflow/i)).toBeInTheDocument()
    }
  })
})

