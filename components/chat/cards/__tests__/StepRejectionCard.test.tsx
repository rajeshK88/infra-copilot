import { render, screen } from '@testing-library/react'
import { StepRejectionCard } from '../StepRejectionCard'

describe('StepRejectionCard', () => {
  it('should render all content including step number, title, rejection message, and retry instructions', () => {
    render(<StepRejectionCard stepNumber={1} stepTitle="VPC Module" />)
    
    // Check main content
    expect(screen.getByText(/Step 1: VPC Module was rejected/i)).toBeInTheDocument()
    expect(screen.getByText(/This step will not be executed/i)).toBeInTheDocument()
    expect(screen.getByText(/Want to try again\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Type your message below to retry/i)).toBeInTheDocument()
  })

  it('should handle missing step number and title fallbacks', () => {
    // Test missing step number
    const { rerender } = render(<StepRejectionCard stepTitle="VPC Module" />)
    expect(screen.getByText(/Step.*VPC Module was rejected/i)).toBeInTheDocument()
    
    // Test missing step title
    rerender(<StepRejectionCard stepNumber={1} />)
    expect(screen.getByText(/Step 1: Untitled Step was rejected/i)).toBeInTheDocument()
  })
})

