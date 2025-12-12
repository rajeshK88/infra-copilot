import { render, screen } from '@testing-library/react'
import { StepCompletionCard } from '../StepCompletionCard'

describe('StepCompletionCard', () => {
  it('should render module name', () => {
    render(<StepCompletionCard moduleName="VPC Module" />)
    expect(screen.getByText(/VPC Module created successfully/i)).toBeInTheDocument()
  })

  it('should render step number when provided', () => {
    render(<StepCompletionCard moduleName="VPC Module" stepNumber={1} />)
    expect(screen.getByText(/Step 1 completed/i)).toBeInTheDocument()
  })

  it('should not render step number when not provided', () => {
    render(<StepCompletionCard moduleName="VPC Module" />)
    expect(screen.queryByText(/Step.*completed/i)).not.toBeInTheDocument()
  })
})

