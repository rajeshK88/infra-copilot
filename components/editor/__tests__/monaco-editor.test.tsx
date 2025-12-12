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

  it('should render empty state, editor with content/metadata, and line/character counts', () => {
    // Test empty state
    const { rerender } = render(<MonacoEditor />)
    expect(screen.getByText('No file selected')).toBeInTheDocument()
    expect(screen.getByText(/Select a file from the file tree/i)).toBeInTheDocument()
    
    // Test editor with file content and metadata
    mockStore.files = [createFile({ path: 'infra/main.tf', content: 'resource "aws_vpc" "main" {}' })]
    mockStore.selectedFile = 'infra/main.tf'
    rerender(<MonacoEditor />)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByText('infra/main.tf')).toBeInTheDocument()
    expect(screen.getByText('HCL')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    
    // Test line and character counts
    mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3' })]
    mockStore.selectedFile = 'test.tf'
    rerender(<MonacoEditor />)
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
    it('should return null when file is undefined and handle all status types correctly', () => {
      // Test undefined file
      render(<MonacoEditor />)
      expect(screen.getByText('No file selected')).toBeInTheDocument()
      
      const statusTests = [
        { status: 'creating' as const, text: 'Creating...', hasSpinner: true },
        { status: 'writing' as const, text: 'Writing...', hasSpinner: true },
        { status: 'complete' as const, text: 'Ready', hasSpinner: false },
        { status: 'unknown' as 'creating' | 'writing' | 'complete', text: 'Unknown', hasSpinner: false },
      ]

      statusTests.forEach(({ status, text, hasSpinner }) => {
        mockStore.files = [createFile({ status })]
        mockStore.selectedFile = 'test.tf'
        const { container, unmount } = render(<MonacoEditor />)
        expect(screen.getByText(text)).toBeInTheDocument()
        if (hasSpinner) {
          expect(container.querySelectorAll('[class*="animate-spin"]').length).toBeGreaterThan(0)
        }
        if (status === 'writing') {
          expect(screen.getByText('Streaming')).toBeInTheDocument()
          expect(screen.getByText('Live streaming')).toBeInTheDocument()
        }
        unmount()
      })
    })
  })

  describe('useEffect auto-scrolling logic', () => {
    const waitForMount = () => new Promise((resolve) => setTimeout(resolve, 150))

    beforeEach(() => {
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()
    })

    it('should handle early returns and empty content cases', async () => {
      // Test early return when file is undefined
      render(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
      
      // Test no scroll when status is writing but content is empty
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

    it('should handle content changes: scroll on increase, no scroll on unchanged or decrease (covers hasNewContent branches)', async () => {
      // Test scrolling when content increases (hasNewContent = true)
      mockStore.files = [createFile({ content: 'line 1', status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()
      
      mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).toHaveBeenCalledWith(3, 1)
      expect(mockEditorInstance.setPosition).toHaveBeenCalledWith({ lineNumber: 3, column: 1 })
      
      // Test no scroll when content unchanged (hasNewContent = false, else branch)
      const fileWithContent = createFile({ content: 'line 1', status: 'writing' })
      mockStore.files = [fileWithContent]
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()
      rerender(<MonacoEditor />)
      await waitForMount()
      rerender(<MonacoEditor />)
      await waitForMount()
      fileWithContent.content = 'line 1' // Same content
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()
      rerender(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
      expect(mockEditorInstance.setPosition).not.toHaveBeenCalled()
      
      // Test no scroll when content decreases (hasNewContent = false, else branch)
      mockStore.files = [createFile({ content: 'line 1\nline 2\nline 3', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()
      mockEditorInstance.revealLine.mockClear()
      mockEditorInstance.setPosition.mockClear()
      mockStore.files = [createFile({ content: 'line 1', status: 'writing' })]
      rerender(<MonacoEditor />)
      await waitForMount()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
      expect(mockEditorInstance.setPosition).not.toHaveBeenCalled()
    })

    it('should reset previousContentLength on complete status and not execute for non-writing/complete statuses', async () => {
      // Test reset when status is complete
      mockStore.files = [createFile({ status: 'writing' })]
      mockStore.selectedFile = 'test.tf'
      const { rerender } = render(<MonacoEditor />)
      await waitForMount()

      mockStore.files = [createFile({ status: 'complete' })]
      rerender(<MonacoEditor />)
      await waitForMount()
      expect(screen.getByText('Ready')).toBeInTheDocument()
      
      // Test no execution when status is neither writing nor complete
      mockStore.files = [createFile({ status: 'creating' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      mockStore.files = [createFile({ content: 'more', status: 'creating' })]
      rerender(<MonacoEditor />)
      await waitForMount()

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(mockEditorInstance.revealLine).not.toHaveBeenCalled()
    })
  })
})

