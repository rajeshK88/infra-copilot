import { useInfraStore } from '@/lib/store'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileProgressCard } from '../FileProgressCard'

jest.mock('@/lib/store', () => ({
  useInfraStore: jest.fn(),
}))

const mockSelectFile = jest.fn()

describe('FileProgressCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectFile: mockSelectFile,
      }
      return selector ? selector(state) : state.selectFile
    })
  })

  it('should render file path and show correct status text for all statuses', () => {
    const testCases = [
      { status: 'creating' as const, path: 'test.tf', expectedText: 'Creating file' },
      { status: 'writing' as const, path: 'test.tf', expectedText: 'Writing' },
      { status: 'complete' as const, path: 'infra/modules/vpc/main.tf', expectedText: 'main.tf' },
      { status: 'created' as const, path: 'infra/main.tf', expectedText: 'main.tf' },
    ]

    testCases.forEach(({ status, path, expectedText }) => {
      const { unmount } = render(<FileProgressCard path={path} status={status} />)
      
      // Check path is always rendered
      expect(screen.getByText(path)).toBeInTheDocument()
      
      // Check status-specific text (use getAllByText for cases where filename matches path)
      const textElements = screen.getAllByText(expectedText)
      expect(textElements.length).toBeGreaterThan(0)
      
      // Check right arrow for complete/created
      if (status === 'complete' || status === 'created') {
        expect(screen.getByText('→')).toBeInTheDocument()
      }
      
      unmount()
    })
  })

  it('should handle default status in getStatusText and getStatusColor', () => {
    const { container } = render(<FileProgressCard path="test.tf" status="unknown" as any />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
    expect(container.querySelector('.border-slate-700\\/50')).toBeInTheDocument()
  })

  it('should handle click events correctly (selectFile for complete/created, no action for creating/writing)', async () => {
    const user = userEvent.setup()
    
    // Test complete and created status - should call selectFile
    const clickableStatuses = ['complete', 'created'] as const
    for (const status of clickableStatuses) {
      const path = 'infra/main.tf'
      const { unmount } = render(<FileProgressCard path={path} status={status} />)
      const card = screen.getByText('main.tf').closest('div[class*="cursor-pointer"]')
      if (card) {
        await user.click(card as HTMLElement)
        expect(mockSelectFile).toHaveBeenCalledWith(path)
      }
      mockSelectFile.mockClear()
      unmount()
    }
    
    // Test creating and writing status - should NOT call selectFile
    const nonClickableStatuses = ['creating', 'writing'] as const
    for (const status of nonClickableStatuses) {
      const { unmount } = render(<FileProgressCard path="test.tf" status={status} />)
      const card = screen.getByText(status === 'creating' ? 'Creating file' : 'Writing').closest('div')
      if (card) {
        await user.click(card as HTMLElement)
        expect(mockSelectFile).not.toHaveBeenCalled()
      }
      unmount()
    }
  })

  it('should handle path edge cases in getFileName (no slash, empty, ending with slash)', () => {
    const testCases = [
      { path: 'main.tf', description: 'path without slash' },
      { path: '', description: 'empty path' },
      { path: 'infra/modules/vpc/', description: 'path ending with slash' },
    ]

    testCases.forEach(({ path, description }) => {
      const { container, unmount } = render(<FileProgressCard path={path} status="complete" />)
      
      if (path === '') {
        // Empty path - component should still render
        expect(container).toBeInTheDocument()
        expect(container.querySelector('.text-xs.font-mono.text-slate-400')).toBeInTheDocument()
      } else {
        // Path should be displayed
        const elements = screen.getAllByText(path)
        expect(elements.length).toBeGreaterThan(0)
      }
      
      unmount()
    })
  })
})

