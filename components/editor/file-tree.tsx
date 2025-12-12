'use client'

import { FileTreeNode, useInfraStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { useMemo } from 'react'

interface TreeNodeProps {
  node: FileTreeNode
  depth: number
  selectedFile: string | null
  expandedFolders: Set<string>
  onSelect: (path: string) => void
  onToggleFolder: (path: string) => void
}

const TreeNode = ({
  node,
  depth,
  selectedFile,
  expandedFolders,
  onSelect,
  onToggleFolder,
}: TreeNodeProps) => {
  const isSelected = selectedFile === node.path
  const isExpanded = expandedFolders.has(node.path)
  const isFolder = node.type === 'folder'
  const hasChildren = node.children && node.children.length > 0

  // Terraform Icon Component
  const TerraformIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const getIcon = () => {
    if (isFolder) {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4 text-blue-400" />
      ) : (
        <Folder className="h-4 w-4 text-blue-400" />
      )
    }

    // Check if it's a Terraform file
    const isTerraformFile = node.path.endsWith('.tf')

    if (node.file) {
      switch (node.file.status) {
        case 'creating':
          return isTerraformFile ? (
            <TerraformIcon className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          ) : (
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          )
        case 'writing':
          return isTerraformFile ? (
            <TerraformIcon className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
          ) : (
            <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
          )
        case 'complete':
          return isTerraformFile ? (
            <TerraformIcon className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          )
        default:
          return isTerraformFile ? (
            <TerraformIcon className="h-3.5 w-3.5 text-purple-400" />
          ) : (
            <File className="h-4 w-4 text-slate-400" />
          )
      }
    }

    return isTerraformFile ? (
      <TerraformIcon className="h-3.5 w-3.5 text-purple-400" />
    ) : (
      <File className="h-4 w-4 text-slate-400" />
    )
  }

  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(node.path)
    } else {
      onSelect(node.path)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-1.5 px-2 py-1.5 text-sm cursor-pointer rounded w-full min-w-0
          hover:bg-slate-800/50 transition-all duration-150
          ${isSelected ? 'bg-slate-800 text-white' : 'text-slate-300'}
          ${node.file?.status === 'writing' ? 'ring-1 ring-yellow-500/30' : ''}
        `}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        onClick={handleClick}
      >
        {isFolder && (
          <div className="flex items-center flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 text-slate-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-slate-400" />
              )
            ) : (
              <div className="w-3" />
            )}
          </div>
        )}
        {!isFolder && <div className="w-3 flex-shrink-0" />}
        <div className="flex-shrink-0">{getIcon()}</div>
        <span className="flex-1 min-w-0 truncate font-mono text-xs select-none">{node.name}</span>
        {node.file?.status === 'complete' && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto flex-shrink-0 text-xs text-green-400"
          >
            ✓
          </motion.span>
        )}
      </motion.div>

      <AnimatePresence>
        {isFolder && isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children!
              .filter((child) => {
                // Filter out invalid nodes: files must have extensions, folders must have children or contain valid files
                if (child.type === 'file') {
                  const ext = child.name.split('.').pop()
                  return child.name.includes('.') && ext !== undefined && ext.length > 0
                }
                // For folders, keep them if they have children or if they're part of a valid path
                return true
              })
              .map((child) => (
                <TreeNode
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                  selectedFile={selectedFile}
                  expandedFolders={expandedFolders}
                  onSelect={onSelect}
                  onToggleFolder={onToggleFolder}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const FileTree = () => {
  const { getFileTree, selectedFile, selectFile, expandedFolders, toggleFolder, files } =
    useInfraStore()

  // Memoize tree to prevent unnecessary recalculations
  // Create a stable key from file paths and statuses
  const filesKey = useMemo(
    () => files.map((f) => `${f.path}:${f.status}`).join('|'),
    [files]
  )

  const tree = useMemo(() => {
    return getFileTree()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesKey])

  if (files.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-slate-800 p-4">
          <File className="h-8 w-8 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-400 mb-1">No files yet</p>
        <p className="text-xs text-slate-500 text-center max-w-xs">
          The agent will create files as we progress through the blueprint steps.
        </p>
      </div>
    )
  }

  // Filter out invalid root nodes before rendering
  const validTree = tree.filter((node) => {
    // Files must have extensions
    if (node.type === 'file') {
      return node.name.includes('.') && node.name.split('.').pop() !== undefined
    }
    // Folders are valid if they have children or are part of valid paths
    return true
  })

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="p-2 w-full">
        {validTree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onSelect={selectFile}
            onToggleFolder={toggleFolder}
          />
        ))}
      </div>
    </div>
  )
}

