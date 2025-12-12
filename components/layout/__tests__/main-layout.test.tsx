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

  it('should render chat panel', () => {
    const { container } = render(<MainLayout blueprint={mockBlueprint} />)
    expect(container.querySelector('[data-testid="chat-panel"]')).toBeInTheDocument()
  })

  it('should render file tree', () => {
    const { container } = render(<MainLayout blueprint={mockBlueprint} />)
    expect(container.querySelector('[data-testid="file-tree"]')).toBeInTheDocument()
  })

  it('should render Monaco editor', () => {
    const { container } = render(<MainLayout blueprint={mockBlueprint} />)
    expect(container.querySelector('[data-testid="monaco-editor"]')).toBeInTheDocument()
  })

  it('should display file count when files exist', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/variables.tf', content: '', status: 'complete' },
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('should display progress bar when files exist', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/variables.tf', content: '', status: 'writing' },
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('should not display progress when no files', () => {
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument()
  })

  it('should filter invalid files from progress count', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'invalid', content: '', status: 'complete' }, // No extension
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('1/1')).toBeInTheDocument()
  })

  it('should handle files with empty path', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: '', content: '', status: 'complete' }, // Empty path
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('1/1')).toBeInTheDocument()
  })

  it('should handle files with no path parts', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'main.tf', content: '', status: 'complete' }, // Root file (valid)
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('should handle files with invalid extension', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: 'infra/file.', content: '', status: 'complete' }, // Empty extension
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    expect(screen.getByText('1/1')).toBeInTheDocument()
  })

  it('should handle files with empty path parts', () => {
    ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        files: [
          { path: 'infra/main.tf', content: '', status: 'complete' },
          { path: '', content: '', status: 'complete' }, // Empty path - should be filtered (line 21)
        ],
      }
      return selector ? selector(state) : state
    })
    render(<MainLayout blueprint={mockBlueprint} />)
    // Empty path should be filtered (line 21: if (!path) return false)
    expect(screen.getByText('1/1')).toBeInTheDocument()
  })

  describe('validFiles filter logic', () => {
    it('should return false when path is empty after trim (line 21)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: '   ', content: '', status: 'complete' }, // Whitespace only
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      expect(screen.getByText('1/1')).toBeInTheDocument()
    })

    it('should return false when parts.length === 0 after split and filter (line 23)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: '///', content: '', status: 'complete' }, // Only slashes
            { path: '/', content: '', status: 'complete' }, // Single slash
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // After split('/').filter(Boolean), parts.length === 0, so should be filtered
      expect(screen.getByText('1/1')).toBeInTheDocument()
    })

    it('should return false when lastPart does not include dot (line 25)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/noextension', content: '', status: 'complete' }, // No extension
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      expect(screen.getByText('1/1')).toBeInTheDocument()
    })

    it('should return false when extension is undefined (line 27)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/file.', content: '', status: 'complete' }, // Empty extension
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // When lastPart is 'file.', split('.').pop() returns '', which is falsy
      expect(screen.getByText('1/1')).toBeInTheDocument()
    })

    it('should return false when extension length is 0 (line 27)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/file.', content: '', status: 'complete' }, // Extension is empty string
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // ext.length === 0, so should be filtered
      expect(screen.getByText('1/1')).toBeInTheDocument()
    })

    it('should return true for valid files with extensions', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/variables.tf', content: '', status: 'complete' },
            { path: 'infra/outputs.tf', content: '', status: 'complete' },
            { path: 'workflow.yml', content: '', status: 'complete' },
            { path: 'config.json', content: '', status: 'complete' },
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      expect(screen.getByText('5/5')).toBeInTheDocument()
    })

    it('should handle paths with leading/trailing slashes', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: '/infra/main.tf', content: '', status: 'complete' }, // Leading slash
            { path: 'infra/main.tf/', content: '', status: 'complete' }, // Trailing slash
            { path: '/infra/variables.tf/', content: '', status: 'complete' }, // Both
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // All should be valid after filter(Boolean) removes empty parts
      expect(screen.getByText('3/3')).toBeInTheDocument()
    })

    it('should handle paths with multiple consecutive slashes', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra//main.tf', content: '', status: 'complete' }, // Double slash
            { path: 'infra///variables.tf', content: '', status: 'complete' }, // Triple slash
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // filter(Boolean) removes empty strings from split
      expect(screen.getByText('2/2')).toBeInTheDocument()
    })

    it('should handle root-level files (no slashes)', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'main.tf', content: '', status: 'complete' }, // Root file
            { path: 'config.yml', content: '', status: 'complete' }, // Root file
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      expect(screen.getByText('2/2')).toBeInTheDocument()
    })

    it('should handle files with multiple dots in name', () => {
      ;(useInfraStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          files: [
            { path: 'infra/main.tf', content: '', status: 'complete' },
            { path: 'infra/file.name.tf', content: '', status: 'complete' }, // Multiple dots
            { path: 'infra/config.min.js', content: '', status: 'complete' }, // Multiple dots
          ],
        }
        return selector ? selector(state) : state
      })
      render(<MainLayout blueprint={mockBlueprint} />)
      // Should use the last part after the last dot as extension
      expect(screen.getByText('3/3')).toBeInTheDocument()
    })
  })
})

