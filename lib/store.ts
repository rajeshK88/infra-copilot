import { create } from 'zustand'

export interface FileItem {
  path: string
  content: string
  status: 'creating' | 'writing' | 'complete'
  createdAt?: number
  updatedAt?: number
}

interface InfraStore {
  files: FileItem[]
  selectedFile: string | null
  expandedFolders: Set<string>

  // Actions
  createFile: (path: string) => void // Step 1: Add to tree (empty)
  streamContent: (path: string, content: string) => void // Step 2: Update content (streaming)
  completeFile: (path: string) => void // Step 3: Mark complete
  selectFile: (path: string) => void
  toggleFolder: (folderPath: string) => void
  getFileTree: () => FileTreeNode[]
  resetStore: () => void // Reset all state (for new chat)
}

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
  file?: FileItem
}

export const useInfraStore = create<InfraStore>((set, get) => ({
  files: [],
  selectedFile: null,
  expandedFolders: new Set<string>(),

  createFile: (path) =>
    set((state) => {
      const normalizedPath = path.trim()
      if (!normalizedPath || state.files.some((f) => f.path === normalizedPath)) {
        return state
      }

      const parts = normalizedPath.split('/').filter(Boolean)
      const newExpanded = new Set(state.expandedFolders)
      let currentPath = ''

      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
        newExpanded.add(currentPath)
      }

      return {
        files: [
          ...state.files,
          { path: normalizedPath, content: '', status: 'creating', createdAt: Date.now() },
        ],
        selectedFile: normalizedPath,
        expandedFolders: newExpanded,
      }
    }),

  streamContent: (path, content) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.path === path ? { ...f, content, status: 'writing', updatedAt: Date.now() } : f
      ),
    })),

  completeFile: (path) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.path === path ? { ...f, status: 'complete', updatedAt: Date.now() } : f
      ),
    })),

  selectFile: (path) => set({ selectedFile: path }),

  toggleFolder: (folderPath) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolders)
      if (newExpanded.has(folderPath)) {
        newExpanded.delete(folderPath)
      } else {
        newExpanded.add(folderPath)
      }
      return { expandedFolders: newExpanded }
    }),

  getFileTree: () => {
    const { files } = get()
    const tree: FileTreeNode[] = []
    const pathMap = new Map<string, FileTreeNode>()

    const validFiles = files.filter((file) => {
      const path = file.path.trim()
      if (!path) return false

      const parts = path.split('/').filter(Boolean)
      if (parts.length === 0) return false

      const lastPart = parts[parts.length - 1]
      if (!lastPart.includes('.')) return false

      const ext = lastPart.split('.').pop()
      if (!ext || ext.length === 0) return false

      return parts.every((part) => part && part.trim() !== '' && part !== '.' && part !== '..')
    })

    const sortedFiles = [...validFiles].sort((a, b) => a.path.localeCompare(b.path))

    sortedFiles.forEach((file) => {
      const parts = file.path.split('/').filter(Boolean)
      let currentPath = ''
      let currentLevel = tree

      for (let index = 0; index < parts.length; index++) {
        const part = parts[index]
        const isLast = index === parts.length - 1
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (isLast) {
          // validFiles filter already ensures files have extensions, so this check is redundant
          const existingFile = currentLevel.find((n) => n.type === 'file' && n.path === currentPath)
          if (existingFile) {
            existingFile.file = file
          } else {
            currentLevel.push({ name: part, path: currentPath, type: 'file', file })
          }
        } else {
          // Get or create folder node
          let folderNode = pathMap.get(currentPath)

          if (!folderNode) {
            // Check if folder already exists in currentLevel (from previous file processing)
            const existingFolder = currentLevel.find((n) => n.type === 'folder' && n.path === currentPath)
            folderNode = existingFolder || { name: part, path: currentPath, type: 'folder', children: [] }
            if (!existingFolder) {
              currentLevel.push(folderNode)
            }
            pathMap.set(currentPath, folderNode)
          } else {
            // Folder exists in pathMap - it should also exist in currentLevel
            // The tree building logic ensures: when a folder is added to pathMap (line 144),
            // it's also added to currentLevel at the same time (line 142).
            // So when we check pathMap later, the folder will always exist in currentLevel.
            // No additional action needed - folderNode is already in currentLevel
          }

          currentLevel = folderNode.children!
        }
      }
    })

    const deduplicateAndSort = (nodes: FileTreeNode[]): FileTreeNode[] => {
      // The tree builder ensures:
      // 1. All nodes have valid names (from parts array)
      // 2. Files always have extensions (validFiles filter)
      // 3. No duplicates exist (pathMap and existing checks)
      // So we only need to sort and recursively process children
      return nodes
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        .map((node) => ({
          ...node,
          children: node.children ? deduplicateAndSort(node.children) : undefined,
        }))
    }

    return deduplicateAndSort(tree)
  },

  resetStore: () =>
    set({
      files: [],
      selectedFile: null,
      expandedFolders: new Set<string>(),
    }),
}))
