import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('should render button with children and apply all variants, sizes, and states correctly', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    // Test basic rendering and default variant
    const { rerender } = render(<Button>Click me</Button>)
    let button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600')
    expect(button).toHaveClass('cursor-pointer')
    
    // Test outline variant
    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('bg-transparent')
    
    // Test sizes
    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
    
    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
    
    // Test click events
    rerender(<Button onClick={handleClick}>Click</Button>)
    button = screen.getByRole('button')
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Test disabled state
    rerender(<Button disabled>Disabled</Button>)
    button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
    
    // Test custom className
    rerender(<Button className="custom-class">Custom</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})

