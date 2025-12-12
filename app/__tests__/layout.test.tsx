import { render } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'

jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({ variable: '--font-geist-sans' })),
  Geist_Mono: jest.fn(() => ({ variable: '--font-geist-mono' })),
}))

jest.mock('../globals.css', () => ({}))
jest.mock('@copilotkit/react-ui/styles.css', () => ({}))

// Suppress hydration warning for layout tests (expected when testing <html> elements)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '')
    if (message.includes('cannot be a child of') || message.includes('hydration error')) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.error = originalError
})

describe('RootLayout', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.body.className = ''
  })

  it('should render layout with children', () => {
    const { container } = render(<RootLayout><div>Test Content</div></RootLayout>)
    expect(container.textContent).toContain('Test Content')
  })

  it('should apply dark theme class to html element', () => {
    render(<RootLayout><div>Test</div></RootLayout>)
    expect(document.documentElement.className).toContain('dark')
  })

  it('should apply font variables and antialiased class to body', () => {
    render(<RootLayout><div>Test</div></RootLayout>)
    const { className } = document.body
    expect(className).toContain('--font-geist-sans')
    expect(className).toContain('--font-geist-mono')
    expect(className).toContain('antialiased')
  })

  it('should export metadata with correct values', () => {
    expect(metadata).toEqual({
      title: 'Infra Copilot - AI-Powered Infrastructure Code Generator',
      description: 'Generate production-ready infrastructure code with AI assistance',
    })
  })
})

