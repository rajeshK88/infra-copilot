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
  it('should render all steps with numbers, types, module sources, and workflow steps', () => {
    render(<BlueprintStepsCard steps={mockSteps} />)
    
    // Check all step titles
    expect(screen.getByText('VPC Module')).toBeInTheDocument()
    expect(screen.getByText('RDS Module')).toBeInTheDocument()
    expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument()
    
    // Check step numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Check module sources
    const cards = screen.getAllByText(/Public Registry|Custom Module/i)
    expect(cards.length).toBeGreaterThan(0)
    
    // Check workflow steps
    expect(screen.getByText('5 steps')).toBeInTheDocument()
    
    // Check step types
    const terraformLabels = screen.getAllByText(/TERRAFORM MODULE/i)
    expect(terraformLabels.length).toBeGreaterThan(0)
    expect(screen.getByText(/GITHUB ACTIONS/i)).toBeInTheDocument()
  })

  it('should handle empty steps array', () => {
    const { container } = render(<BlueprintStepsCard steps={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should handle different step types and configurations', () => {
    const testCases = [
      {
        name: 'steps without number',
        steps: [{ title: 'Step 1', type: 'terraform-module' }],
        expected: 'Step 1',
      },
      {
        name: 'terraform-environment type',
        steps: [{ number: 1, title: 'Environment', type: 'terraform-environment' }],
        expected: /TERRAFORM ENVIRONMENT/i,
      },
      {
        name: 'custom module source',
        steps: [{ number: 1, title: 'Custom Module', type: 'terraform-module', moduleSource: 'custom' }],
        expected: /Custom Module/i,
      },
      {
        name: 'steps without moduleSource (defaults to Custom Module)',
        steps: [{ number: 1, title: 'Step', type: 'terraform-module' }],
        expected: /Custom Module/i,
      },
    ]

    testCases.forEach(({ name: _name, steps, expected }) => {
      const { container } = render(<BlueprintStepsCard steps={steps as Step[]} />)
      if (typeof expected === 'string') {
        expect(screen.getByText(expected)).toBeInTheDocument()
      } else {
        expect(container.textContent).toMatch(expected)
      }
    })
    
    // Test terraform-environment details separately
    const envSteps = [{ number: 1, title: 'Environment', type: 'terraform-environment' }]
    const { container } = render(<BlueprintStepsCard steps={envSteps as Step[]} />)
    expect(container.textContent).toMatch(/small scale/i)
  })

  it('should handle edge cases for step type (undefined, null, empty, unknown)', () => {
    const testCases = [
      { title: 'Step', type: undefined },
      { title: 'Unknown Step', type: 'unknown-type' },
      { title: 'Step', type: '' },
      { title: 'Step', type: null },
    ]

    testCases.forEach(({ title, type }) => {
      const { unmount } = render(<BlueprintStepsCard steps={[{ number: 1, title, type }] as Step[]} />)
      expect(screen.getByText(title)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle step.title || \'Untitled\' fallback for undefined, null, and empty string', () => {
    const testCases = [
      { title: undefined },
      { title: null },
      { title: '' },
    ]

    testCases.forEach(({ title }) => {
      const { unmount } = render(<BlueprintStepsCard steps={[{ number: 1, title, type: 'terraform-module' }] as Step[]} />)
      expect(screen.getByText('Untitled')).toBeInTheDocument()
      unmount()
    })
  })
})

