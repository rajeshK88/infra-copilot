import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepConfirmationCard } from '../StepConfirmationCard'

const mockStep = {
  stepNumber: 1,
  stepTitle: 'VPC Module',
  description: 'Create VPC infrastructure',
  moduleName: 'vpc',
  moduleSource: 'Public Registry',
  keyRequirements: ['Requirement 1', 'Requirement 2'],
}

describe('StepConfirmationCard', () => {
  it('should render all step information including number, title, description, module details, and requirements', () => {
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={jest.fn()} />)
    
    // Check main content
    expect(screen.getByText(/Continue with step 1: VPC Module/i)).toBeInTheDocument()
    expect(screen.getByText(/Create VPC infrastructure/i)).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    
    // Check module details
    expect(screen.getByText(/Module:/i)).toBeInTheDocument()
    expect(screen.getByText(/Source:/i)).toBeInTheDocument()
    
    // Check requirements
    expect(screen.getByText('Requirement 1')).toBeInTheDocument()
    expect(screen.getByText('Requirement 2')).toBeInTheDocument()
  })

  it('should call onConfirm and onCancel when buttons are clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<StepConfirmationCard step={mockStep} onConfirm={onConfirm} onCancel={onCancel} />)
    
    // Test approve button
    const approveButton = screen.getByRole('button', { name: /approve & continue/i })
    await user.click(approveButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
    
    // Test cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should handle optional fields and fallbacks correctly', () => {
    const testCases = [
      {
        name: 'without moduleName',
        step: { stepNumber: 1, stepTitle: 'Step 1', description: 'Description' },
        expected: /Continue with step 1/i,
      },
      {
        name: 'without moduleSource',
        step: { stepNumber: 1, stepTitle: 'Step 1', description: 'Description', moduleName: 'vpc' },
        expected: /Continue with step 1/i,
      },
      {
        name: 'without keyRequirements',
        step: {
          stepNumber: 1,
          stepTitle: 'Step 1',
          description: 'Description',
          moduleName: 'vpc',
          moduleSource: 'Public Registry',
        },
        expected: /Continue with step 1/i,
      },
      {
        name: 'without description',
        step: { stepNumber: 1, stepTitle: 'Step 1', moduleName: 'vpc' },
        expected: /Continue with step 1/i,
      },
      {
        name: 'without stepNumber (shows ?)',
        step: { stepTitle: 'Step 1', description: 'Test' },
        expected: '?',
      },
      {
        name: 'without stepTitle (shows Untitled Step)',
        step: { stepNumber: 1, description: 'Test' },
        expected: /Untitled Step/i,
      },
    ]

    testCases.forEach(({ name: _name, step, expected }) => {
      const { unmount } = render(
        <StepConfirmationCard step={step as Step} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )
      if (typeof expected === 'string') {
        expect(screen.getByText(expected)).toBeInTheDocument()
      } else {
        expect(screen.getByText(expected)).toBeInTheDocument()
      }
      unmount()
    })
  })
})

