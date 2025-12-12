import { render, screen } from '@testing-library/react'
import { BlueprintStepsCard } from '../BlueprintStepsCard'

type Step = {
  number?: number
  title?: string | null
  type?: string | null
  moduleSource?: string
  workflowSteps?: number
}

const mockSteps = [
  {
    number: 1,
    title: 'VPC Module',
    type: 'terraform-module',
    moduleSource: 'Public Registry',
  },
  {
    number: 2,
    title: 'RDS Module',
    type: 'terraform-module',
    moduleSource: 'Custom Module',
  },
  {
    number: 3,
    title: 'CI/CD Pipeline',
    type: 'github-actions',
    workflowSteps: 5,
  },
]

describe('BlueprintStepsCard', () => {
  it('should render all steps', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    expect(screen.getByText('VPC Module')).toBeInTheDocument()
    expect(screen.getByText('RDS Module')).toBeInTheDocument()
    expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument()
  })

  it('should render step numbers', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render module source when provided', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    // Module source appears in the card
    const cards = screen.getAllByText(/Public Registry|Custom Module/i)
    expect(cards.length).toBeGreaterThan(0)
  })

  it('should render workflow steps for GitHub Actions', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    expect(screen.getByText('5 steps')).toBeInTheDocument()
  })

  it('should render step types', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    // Step types are rendered as labels (may appear multiple times)
    const terraformLabels = screen.getAllByText(/TERRAFORM MODULE/i)
    expect(terraformLabels.length).toBeGreaterThan(0)
    expect(screen.getByText(/GITHUB ACTIONS/i)).toBeInTheDocument()
  })

  it('should handle empty steps array', () => {
    const { container } = render(<BlueprintStepsCard steps={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should handle steps without number', () => {
    const stepsWithoutNumber = [
      {
        title: 'Step 1',
        type: 'terraform-module',
      },
    ]
    render(<BlueprintStepsCard steps={stepsWithoutNumber as Step[]} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should handle terraform-environment type', () => {
    const envSteps = [
      {
        number: 1,
        title: 'Environment',
        type: 'terraform-environment',
      },
    ]
    render(<BlueprintStepsCard steps={envSteps as Step[]} />)
    expect(screen.getByText(/TERRAFORM ENVIRONMENT/i)).toBeInTheDocument()
  })

  it('should handle custom module source', () => {
    const customSteps = [
      {
        number: 1,
        title: 'Custom Module',
        type: 'terraform-module',
        moduleSource: 'custom',
      },
    ]
    render(<BlueprintStepsCard steps={customSteps as Step[]} />)
    // Multiple elements contain "Custom Module" - use getAllByText
    const elements = screen.getAllByText(/Custom Module/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('should handle terraform-environment details', () => {
    const envSteps = [
      {
        number: 1,
        title: 'Environment',
        type: 'terraform-environment',
      },
    ]
    render(<BlueprintStepsCard steps={envSteps as Step[]} />)
    expect(screen.getByText(/small scale/i)).toBeInTheDocument()
  })

  it('should handle steps without moduleSource', () => {
    const stepsWithoutSource = [
      {
        number: 1,
        title: 'Step',
        type: 'terraform-module',
      },
    ]
    const { container } = render(<BlueprintStepsCard steps={stepsWithoutSource as Step[]} />)
    // Default shows "Custom Module"
    expect(container.textContent).toMatch(/Custom Module/i)
  })

  it('should handle undefined type in getStepTypeIcon', () => {
    const noTypeSteps = [
      {
        number: 1,
        title: 'Step',
        type: undefined,
      },
    ]
    render(<BlueprintStepsCard steps={noTypeSteps as Step[]} />)
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('should handle unknown type in getStepTypeIcon', () => {
    const unknownTypeSteps = [
      {
        number: 1,
        title: 'Unknown Step',
        type: 'unknown-type',
      },
    ]
    render(<BlueprintStepsCard steps={unknownTypeSteps as Step[]} />)
    expect(screen.getByText('Unknown Step')).toBeInTheDocument()
  })

  it('should handle empty type in getStepTypeLabel', () => {
    const noTypeSteps = [
      {
        number: 1,
        title: 'Step',
        type: '',
      },
    ]
    render(<BlueprintStepsCard steps={noTypeSteps as Step[]} />)
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('should handle null type in getStepTypeColor', () => {
    const nullTypeSteps = [
      {
        number: 1,
        title: 'Step',
        type: null,
      },
    ]
    render(<BlueprintStepsCard steps={nullTypeSteps as Step[]} />)
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('should handle getStepTypeIcon returning null (line 58)', () => {
    const unknownTypeSteps = [
      {
        number: 1,
        title: 'Unknown Step',
        type: 'unknown-type',
      },
    ]
    render(<BlueprintStepsCard steps={unknownTypeSteps as Step[]} />)
    // Should render without crashing when icon is null
    expect(screen.getByText('Unknown Step')).toBeInTheDocument()
  })

  it('should handle getStepTypeLabel with empty type (line 66)', () => {
    const noTypeSteps = [
      {
        number: 1,
        title: 'Step',
        type: '',
      },
    ]
    render(<BlueprintStepsCard steps={noTypeSteps as Step[]} />)
    // Should return empty string for empty type
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('should handle getStepTypeColor with null type (line 74)', () => {
    const nullTypeSteps = [
      {
        number: 1,
        title: 'Step',
        type: null,
      },
    ]
    render(<BlueprintStepsCard steps={nullTypeSteps as Step[]} />)
    // Should return default color for null type
    expect(screen.getByText('Step')).toBeInTheDocument()
  })

  it('should handle step.title || \'Untitled\' when title is undefined (line 144)', () => {
    const stepsWithUndefinedTitle = [
      {
        number: 1,
        title: undefined,
        type: 'terraform-module',
      },
    ]
    render(<BlueprintStepsCard steps={stepsWithUndefinedTitle as Step[]} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('should handle step.title || \'Untitled\' when title is null', () => {
    const stepsWithNullTitle = [
      {
        number: 1,
        title: null,
        type: 'terraform-module',
      },
    ]
    render(<BlueprintStepsCard steps={stepsWithNullTitle as Step[]} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('should handle step.title || \'Untitled\' when title is empty string', () => {
    const stepsWithEmptyTitle = [
      {
        number: 1,
        title: '',
        type: 'terraform-module',
      },
    ]
    render(<BlueprintStepsCard steps={stepsWithEmptyTitle as Step[]} />)
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })
})

