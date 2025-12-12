import { render, screen } from '@testing-library/react'
import { StepRejectionCard } from '../StepRejectionCard'

describe('StepRejectionCard', () => {
  it('should render step number and title', () => {
    render(<StepRejectionCard stepNumber={1} stepTitle="VPC Module" />)
    expect(screen.getByText(/Step 1: VPC Module was rejected/i)).toBeInTheDocument()
  })

  it('should render rejection message', () => {
    render(<StepRejectionCard stepNumber={1} stepTitle="VPC Module" />)
    expect(screen.getByText(/This step will not be executed/i)).toBeInTheDocument()
  })

  it('should render retry instructions', () => {
    render(<StepRejectionCard stepNumber={1} stepTitle="VPC Module" />)
    expect(screen.getByText(/Want to try again\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Type your message below to retry/i)).toBeInTheDocument()
  })

  it('should handle missing step number', () => {
    render(<StepRejectionCard stepTitle="VPC Module" />)
    expect(screen.getByText(/Step.*VPC Module was rejected/i)).toBeInTheDocument()
  })

  it('should handle missing step title', () => {
    render(<StepRejectionCard stepNumber={1} />)
    expect(screen.getByText(/Step 1: Untitled Step was rejected/i)).toBeInTheDocument()
  })
})

