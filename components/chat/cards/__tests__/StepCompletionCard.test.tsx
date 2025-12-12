import { render, screen } from '@testing-library/react'
import { StepCompletionCard } from '../StepCompletionCard'

describe('StepCompletionCard', () => {
  it('should render module name and conditionally render step number', () => {
    // Test without step number
    const { rerender } = render(<StepCompletionCard moduleName="VPC Module" />)
    expect(screen.getByText(/VPC Module created successfully/i)).toBeInTheDocument()
    expect(screen.queryByText(/Step.*completed/i)).not.toBeInTheDocument()
    
    // Test with step number
    rerender(<StepCompletionCard moduleName="VPC Module" stepNumber={1} />)
    expect(screen.getByText(/Step 1 completed/i)).toBeInTheDocument()
    expect(screen.getByText(/VPC Module created successfully/i)).toBeInTheDocument()
  })
})

