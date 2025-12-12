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
  it('should render step information', () => {
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText(/Continue with step 1: VPC Module/i)).toBeInTheDocument()
    expect(screen.getByText(/Create VPC infrastructure/i)).toBeInTheDocument()
  })

  it('should render step number', () => {
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should render module details when provided', () => {
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={jest.fn()} />)
    // Module name appears in the details section
    expect(screen.getByText(/Module:/i)).toBeInTheDocument()
    expect(screen.getByText(/Source:/i)).toBeInTheDocument()
  })

  it('should render key requirements when provided', () => {
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText('Requirement 1')).toBeInTheDocument()
    expect(screen.getByText('Requirement 2')).toBeInTheDocument()
  })

  it('should call onConfirm when approve button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(<StepConfirmationCard step={mockStep} onConfirm={onConfirm} onCancel={jest.fn()} />)
    const approveButton = screen.getByRole('button', { name: /approve & continue/i })
    await user.click(approveButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()
    render(<StepConfirmationCard step={mockStep} onConfirm={jest.fn()} onCancel={onCancel} />)
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should render without moduleName', () => {
    const stepWithoutModule = {
      stepNumber: 1,
      stepTitle: 'Step 1',
      description: 'Description',
    }
    render(
      <StepConfirmationCard step={stepWithoutModule as Step} onConfirm={jest.fn()} onCancel={jest.fn()} />
    )
    expect(screen.getByText(/Continue with step 1/i)).toBeInTheDocument()
  })

  it('should render without moduleSource', () => {
    const stepWithoutSource = {
      stepNumber: 1,
      stepTitle: 'Step 1',
      description: 'Description',
      moduleName: 'vpc',
    }
    render(
      <StepConfirmationCard
        step={stepWithoutSource as Step}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText(/Continue with step 1/i)).toBeInTheDocument()
  })

  it('should render without keyRequirements', () => {
    const stepWithoutReqs = {
      stepNumber: 1,
      stepTitle: 'Step 1',
      description: 'Description',
      moduleName: 'vpc',
      moduleSource: 'Public Registry',
    }
    render(
      <StepConfirmationCard
        step={stepWithoutReqs as Step}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText(/Continue with step 1/i)).toBeInTheDocument()
  })

  it('should render without description', () => {
    const stepWithoutDesc = {
      stepNumber: 1,
      stepTitle: 'Step 1',
      moduleName: 'vpc',
    }
    render(
      <StepConfirmationCard
        step={stepWithoutDesc as Step}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText(/Continue with step 1/i)).toBeInTheDocument()
  })

  it('should render with stepNumber as ? when missing', () => {
    const stepWithoutNumber = {
      stepTitle: 'Step 1',
      description: 'Test',
    }
    render(
      <StepConfirmationCard
        step={stepWithoutNumber as Step}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('should render with Untitled Step when stepTitle missing', () => {
    const stepWithoutTitle = {
      stepNumber: 1,
      description: 'Test',
    }
    render(
      <StepConfirmationCard
        step={stepWithoutTitle as Step}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText(/Untitled Step/i)).toBeInTheDocument()
  })
})

