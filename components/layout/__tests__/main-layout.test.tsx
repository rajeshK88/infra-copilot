import { render, screen } from '@testing-library/react'
import { MainLayout } from '../main-layout'
import { Blueprint } from '@/lib/blueprints'
import { useInfraStore } from '@/lib/store'

jest.mock('@/lib/store', () => ({
  useInfraStore: jest.fn(),
}))

jest.mock('@/components/chat/chat-panel', () => ({
  ChatPanel: ({ blueprint }: { blueprint: Blueprint }) => (
    <div data-testid="chat-panel">{blueprint.name}</div>
  ),
}))

jest.mock('@/components/editor/file-tree', () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}))

jest.mock('@/components/editor/monaco-editor', () => ({
  MonacoEditor: () => <div data-testid="monaco-editor">Monaco Editor</div>,
}))

jest.mock('react-resizable-panels', () => {
  return {
    PanelGroup: ({ children, direction }: { children: React.ReactNode; direction?: string }) => (
      <div data-testid="panel-group" data-direction={direction}>
        {children}
      </div>
    ),
    Panel: ({ children, defaultSize }: { children: React.ReactNode; defaultSize?: number }) => (
      <div data-testid="panel" data-size={defaultSize}>
        {children}
      </div>
    ),
    PanelResizeHandle: () => <div data-testid="panel-resize-handle" />,
  }
})

const mockBlueprint: Blueprint = {
  id: '1',
  slug: 'test',
  name: 'Test Blueprint',
  description: 'Test',
  cost: '$10',
  setupTime: '5 min',
  technologies: ['Terraform'],
  category: 'Web',
  cloudProvider: 'AWS',
  whatYouBuild: 'Test',
  steps: [],
}

describe('MainLayout', () => {
  beforeEach(() => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = { files: [] }
      return selector ? selector(state) : state
    })
  })

  it('should render all main components (chat panel, file tree, Monaco editor)', () => {
    const { container } = render(<MainLayout blueprint={mockBlueprint} />)
    expect(container.querySelector('[data-testid="chat-panel"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="file-tree"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="monaco-editor"]')).toBeInTheDocument()
  })

  it('should display file count and progress correctly', () => {
    // Test no progress when no files
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument()
    
    // Test file count when all complete
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/variables.tf', content: '', status: 'complete' },
        ],
      }
      return selector ? selector(state) : state
    })
    const { rerender } = render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('2/2')).toBeInTheDocument()
    
    // Test progress bar when some files are writing
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/variables.tf', content: '', status: 'writing' },
        ],
      }
      return selector ? selector(state) : state
    })
    rerender(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('should filter invalid files correctly (empty path, no extension, invalid extension)', () => {
    const testCases = [
      {
        name: 'no extension',
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'invalid', content: '', status: 'complete' },
        ],
        expected: '1/1',
      },
      {
        name: 'empty path',
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: '', content: '', status: 'complete' },
        ],
        expected: '1/1',
      },
      {
        name: 'empty extension',
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/file.', content: '', status: 'complete' },
        ],
        expected: '1/1',
      },
      {
        name: 'root file (valid)',
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'main.tf', content: '', status: 'complete' },
        ],
        expected: '2/2',
      },
    ]

    testCases.forEach(({ name: _name, files, expected }) => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = { files }
        return selector ? selector(state) : state
      })
      const { unmount } = render(<MainLayout blueprint={mockBlueprint} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })

  describe('validFiles filter logic', () => {
    it('should handle all edge cases and valid file paths correctly', () => {
      const testCases = [
        {
          name: 'empty path after trim',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: '   ', content: '', status: 'complete' },
          ],
          expected: '1/1',
        },
        {
          name: 'parts.length === 0 after split',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: '///', content: '', status: 'complete' },
            { path: '/', content: '', status: 'complete' },
          ],
          expected: '1/1',
        },
        {
          name: 'no extension',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/noextension', content: '', status: 'complete' },
          ],
          expected: '1/1',
        },
        {
          name: 'empty extension',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/file.', content: '', status: 'complete' },
          ],
          expected: '1/1',
        },
        {
          name: 'valid files with extensions',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/variables.tf', content: '', status: 'complete' },
            { path: 'infra/outputs.tf', content: '', status: 'complete' },
            { path: 'workflow.yml', content: '', status: 'complete' },
            { path: 'config.json', content: '', status: 'complete' },
          ],
          expected: '5/5',
        },
        {
          name: 'leading/trailing slashes',
          files: [
            { path: '/infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/main.tf/', content: '', status: 'complete' },
            { path: '/infra/variables.tf/', content: '', status: 'complete' },
          ],
          expected: '3/3',
        },
        {
          name: 'multiple consecutive slashes',
          files: [
            { path: 'infra//main.tf', content: '', status: 'complete' },
            { path: 'infra///variables.tf', content: '', status: 'complete' },
          ],
          expected: '2/2',
        },
        {
          name: 'root-level files',
          files: [
            { path: 'main.tf', content: '', status: 'complete' },
            { path: 'config.yml', content: '', status: 'complete' },
          ],
          expected: '2/2',
        },
        {
          name: 'multiple dots in name',
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/file.name.tf', content: '', status: 'complete' },
            { path: 'infra/config.min.js', content: '', status: 'complete' },
          ],
          expected: '3/3',
        },
      ]

      testCases.forEach(({ name: _name, files, expected }) => {
        ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
          const state = { files }
          return selector ? selector(state) : state
        })
        const { unmount } = render(<MainLayout blueprint={mockBlueprint} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })
})

