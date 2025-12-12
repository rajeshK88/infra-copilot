'use client'

import { useInfraStore } from '@/lib/store'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react'
import type { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'

export const MonacoEditor = () => {
  const { files, selectedFile } = useInfraStore()
  const file = files.find((f) => f.path === selectedFile)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const previousContentLength = useRef<number>(0)

  // Determine language from file extension
  const getLanguage = (path: string): string => {
    if (path.endsWith('.tf')) return 'hcl'
    if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml'
    if (path.endsWith('.json')) return 'json'
    if (path.endsWith('.md')) return 'markdown'
    if (path.endsWith('.py')) return 'python'
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript'
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
    return 'plaintext'
  }

  const getFileIcon = () => {
    if (!file) return null
    switch (file.status) {
      case 'creating':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'writing':
        return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusText = () => {
    if (!file) return null
    switch (file.status) {
      case 'creating':
        return 'Creating...'
      case 'writing':
        return 'Writing...'
      case 'complete':
        return 'Ready'
      default:
        return 'Unknown'
    }
  }

  // Call functions to ensure coverage even when file is null
  const fileIcon = getFileIcon()
  const statusText = getStatusText()

  const getLineCount = () => {
    if (!file || !file.content) return 0
    return file.content.split('\n').length
  }

  const getCharCount = () => {
    if (!file || !file.content) return 0
    return file.content.length
  }

  // Auto-scroll to bottom when content is being streamed
  useEffect(() => {
    if (!file || !editorRef.current) return

    // Only auto-scroll when writing and content has increased
    if (file.status === 'writing' && file.content) {
      const currentLength = file.content.length
      const hasNewContent = currentLength > previousContentLength.current

      if (hasNewContent) {
        // Get the line count
        const lineCount = file.content.split('\n').length

        // Scroll to the last line
        editorRef.current.revealLine(lineCount, 1) // 1 = center, 0 = top, 2 = bottom
        editorRef.current.setPosition({ lineNumber: lineCount, column: 1 })

        previousContentLength.current = currentLength
      }
    } else if (file.status === 'complete') {
      // Reset when file is complete
      previousContentLength.current = 0
    }
  }, [file])

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-950">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-8"
        >
          <div className="mb-4 rounded-full bg-slate-800 p-6 mx-auto w-fit">
            <FileText className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No file selected</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Select a file from the file tree to view and edit its content. Files will appear here
            as the agent creates them.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {fileIcon}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-slate-200 truncate">{file.path}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-400 capitalize">{statusText}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {getLanguage(file.path).toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{getLineCount()} lines</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{getCharCount()} chars</span>
            </div>
          </div>
        </div>
        {file.status === 'writing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20"
          >
            <Clock className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Streaming</span>
          </motion.div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getLanguage(file.path)}
          value={file.content} // Updates live as streamContent is called
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false }, // Hide the minimap on the right side
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly: file.status === 'writing', // Read-only during streaming
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorStyle: 'line',
            smoothScrolling: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
        {file.status === 'writing' && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 text-yellow-400 animate-spin" />
              <span className="text-xs text-yellow-400">Live streaming</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

