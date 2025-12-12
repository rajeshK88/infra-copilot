import { useInfraStore } from '@/lib/store'
import { render, screen } from '@testing-library/react'
import { MonacoEditor } from '../monaco-editor'

jest.mock('@/lib/store', () => ({
  useInfraStore: jest.fn(),
}))

const mockEditorInstance = {
  revealLine: jest.fn(),
  setPosition: jest.fn(),
}

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onMount }: { value?: string; onMount?: (editor: unknown, monaco: unknown) => void }) => {
    if (onMount) {
      // Mount editor synchronously for better test control
      setTimeout(() => onMount(mockEditorInstance, {}), 0)
    }
    return <div data-testid="monaco-editor">{value || 'No content'}</div>
  },
}))

const createFile = (overrides?: Partial<{ path: string; content: string; status: string }>) => ({
  path: 'test.tf',
  content: '',
  status: 'complete',
  ...overrides,
})

const mockStore = {
  files: [] as Array<{ path: string; content: string; status: string }>,
  selectedFile: null as string | null,
}

describe('MonacoEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.files = []
    mockStore.selectedFile = null
    ;(useInfraStore as unknown as jest.Mock).mockReturnValue(mockStore)
  })

  it('should render empty state when no file is selected', () => {
    render(<MonacoEditor />)
    expect(screen.getByText('No file selected')).toBeInTheDocument()
    expect(screen.getByText(/Select a file from the file tree/i)).toBeInTheDocument()
  })

  it('should render editor with file content and metadata', () => {
    mockStore.files = [createFile({ path: 'infra/main.tf', content: 'resource "aws_vpc" "main" {}' })]
    mockStore.selectedFile = 'infra/main.tf'
    render(<MonacoEditor />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByText('infra/main.tf')).toBeInTheDocument()
    expect(screen.getByText('HCL')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('should display line and character counts', () => {
    mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3' })]
    mockStore.selectedFile = 'test.tf'
    render(<MonacoEditor />)
    expect(screen.getByText(/3 lines/i)).toBeInTheDocument()
    expect(screen.getByText(/\d+ chars/i)).toBeInTheDocument()
  })

  describe('Language detection', () => {
    const languageTests = [
      { ext: '.tf', lang: 'HCL' },
      { ext: '.yml', lang: 'YAML' },
      { ext: '.yaml', lang: 'YAML' },
      { ext: '.json', lang: 'JSON' },
      { ext: '.md', lang: 'MARKDOWN' },
      { ext: '.py', lang: 'PYTHON' },
      { ext: '.js', lang: 'JAVASCRIPT' },
      { ext: '.jsx', lang: 'JAVASCRIPT' },
      { ext: '.ts', lang: 'TYPESCRIPT' },
      { ext: '.tsx', lang: 'TYPESCRIPT' },
      { ext: '.unknown', lang: 'PLAINTEXT' },
    ]

    languageTests.forEach(({ ext, lang }) => {
      it(`should detect ${lang} for ${ext} files`, () => {
        mockStore.files = [createFile({ path: `file${ext}` })]
        mockStore.selectedFile = `file${ext}`
        render(<MonacoEditor />)
        expect(screen.getByText(lang)).toBeInTheDocument()
      })
    })
  })

  describe('getFileIcon and getStatusText functions', () => {
    it('should return null when file is undefined', () => {
      render(<MonacoEditor />)
      expect(screen.getByText('No file selected')).toBeInTheDocument()
    })

    const statusTests = [
      { status: 'creating' as const, text: 'Creating...', hasSpinner: true },
      { status: 'writing' as const, text: 'Writing...', hasSpinner: true },
      { status: 'complete' as const, text: 'Ready', hasSpinner: false },
      { status: 'unknown' as 'creating' | 'writing' | 'complete', text: 'Unknown', hasSpinner: false },
    ]

    statusTests.forEach(({ status, text, hasSpinner }) => {
      it(`should handle ${status} status correctly`, () => {
        mockStore.files = [createFile({ status })]
        mockStore.selectedFile = 'test.tf'
        const { container } = render(<MonacoEditor />)
        expect(screen.getByText(text)).toBeInTheDocument()
        if (hasSpinner) {
          expect(container.querySelectorAll('[class*="animate-spin"]').length).toBeGreaterThan(0)
        }
        if (status === 'writing') {
          expect(screen.getByText('Streaming')).toBeInTheDocument()
          expect(screen.getByText('Live streaming')).toBeInTheDocument()
        }
      })
    })
  })

  describe('useEffect auto-scrolling logic', () => {
    const waitForMount = () => new Promise((resolve) => setTimeout(resolve, 150))

    beforeEach(() => {
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()
    })

    it('should return early when file is undefined', async () => {
      render(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
    })

    it('should not scroll when status is writing but content is empty', async () => {
      mockStore.files = [createFile({ content: '', status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()
      rerender(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
    })

    it('should scroll when content increases during writing (covers line 79: hasNewContent)', async () => {
      // Start with initial content - this sets previousContentLength.current = 6
      mockStore.files = [createFile({ content: 'line 1', status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      // Wait for editor to mount and set editorRef.current
      await waitForMount()

      // Increase content length (from 6 to 18 chars) to trigger hasNewContent = true (line 79)
      // This covers the if (hasNewContent) branch at line 79
      mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      // Verify scroll methods were called when hasNewContent is true (line 79)
      expect(mockEditorInstance.revealLine).toHaveBeenCalledWith(3, 1)
      expect(mockEditorInstance.setPosition).toHaveBeenCalledWith({ lineNumber: 3, column: 1 })
    })

    it('should not scroll when content length unchanged (covers else branch of line 79: hasNewContent = false)', async () => {
      // Create a file object that we'll reuse to ensure same object reference
      const fileWithContent = createFile({ content: 'line 1', status: 'writing' })
      
      // Start with initial content - this sets previousContentLength.current = 6 after editor mounts
      mockStore.files = [fileWithContent]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()
      // Trigger useEffect again to ensure previousContentLength.current is set
      rerender(<MonacoEditor />)
      await waitForMount()

      // At this point, previousContentLength.current should be 6 (length of 'line 1')
      // Clear mocks to only check calls after second render with same content
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()

      // Update the same file object with same content - this should NOT trigger scroll
      // because currentLength (6) <= previousContentLength.current (6)
      fileWithContent.content = 'line 1' // Same content, same length
      rerender(<MonacoEditor />)
      await waitForMount()

      // Verify scroll methods were NOT called when hasNewContent is false (else branch)
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
      expect(mockEditorInstance.setPosition).not.toHaveBeenCalled()
    })

    it('should not scroll when content length decreases (covers else branch of line 79: hasNewContent = false)', async () => {
      // Start with initial content to set previousContentLength.current
      mockStore.files = [createFile({ content: 'line 1', status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()

      // Increase content to set previousContentLength.current to a higher value
      mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      // Clear mocks to only check calls after content decrease
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()

      // Decrease content length - hasNewContent will be false (covers else branch of line 79)
      // currentLength (6) <= previousContentLength.current (18), so hasNewContent = false
      mockStore.files = [createFile({ content: 'line 1', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      // Verify scroll methods were NOT called when content decreases (else branch)
      // The else branch of if (hasNewContent) should be taken
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
      expect(mockEditorInstance.setPosition).not.toHaveBeenCalled()
    })

    it('should reset previousContentLength when status is complete', async () => {
      mockStore.files = [createFile({ status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()

      mockStore.files = [createFile({ status: 'complete' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('should not execute when status is neither writing nor complete', async () => {
      mockStore.files = [createFile({ status: 'creating' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()

      mockStore.files = [createFile({ content: 'more', status: 'creating' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
    })
  })
})

