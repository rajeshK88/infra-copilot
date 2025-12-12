'use client'

import { ChatPanel } from '@/components/chat/chat-panel'
import { FileTree } from '@/components/editor/file-tree'
import { MonacoEditor } from '@/components/editor/monaco-editor'
import { Blueprint } from '@/lib/blueprints'
import { useInfraStore } from '@/lib/store'
import { FolderOpen } from 'lucide-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface MainLayoutProps {
  blueprint: Blueprint
}

export const MainLayout = ({ blueprint }: MainLayoutProps) => {
  const files = useInfraStore((state) => state.files)
  
  // Only count valid files (with extensions) for progress
  const validFiles = files.filter((f) => {
    const path = f.path.trim()
    if (!path) return false
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0) return false
    const lastPart = parts[parts.length - 1]
    if (!lastPart.includes('.')) return false
    const ext = lastPart.split('.').pop()
    return ext !== undefined && ext.length > 0
  })
  
  const fileCount = validFiles.length
  const completeCount = validFiles.filter((f) => f.status === 'complete').length

  return (
    <div className="h-screen flex bg-slate-950">
      {/* Left Panel: Chat */}
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={25} maxSize={50}>
          <div className="h-full border-r border-slate-800 bg-slate-950 flex flex-col">
            <ChatPanel blueprint={blueprint} />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-slate-700 transition-colors cursor-col-resize" />

        {/* Right Panel: File Tree + Editor */}
        <Panel defaultSize={70} minSize={50}>
          <PanelGroup direction="horizontal">
            {/* File Tree */}
            <Panel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full border-r border-slate-800 bg-slate-950 flex flex-col">
                <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-400" />
                      <h2 className="text-sm font-semibold text-white">Files</h2>
                    </div>
                    {fileCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">
                          {completeCount}/{fileCount}
                        </span>
                        <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${(completeCount / fileCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <FileTree />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-slate-700 transition-colors cursor-col-resize" />

            {/* Monaco Editor */}
            <Panel defaultSize={75} minSize={60}>
              <div className="h-full bg-slate-950">
                <MonacoEditor />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}

