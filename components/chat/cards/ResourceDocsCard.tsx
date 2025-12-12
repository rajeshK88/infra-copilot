'use client'

import { FileText, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface ResourceDoc {
  name: string
  status: 'found' | 'not-found'
  linesRead?: number
}

interface ResourceDocsCardProps {
  resources: ResourceDoc[]
}

export const ResourceDocsCard = ({ resources }: ResourceDocsCardProps) => {
  if (!resources || resources.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-purple-500/30 rounded-lg bg-slate-900/50 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20">
          <FileText className="h-4 w-4 text-purple-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Read resource documentation</h3>
      </div>

      {/* Resource List */}
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="flex items-center justify-between px-3 py-2 bg-slate-800/30 rounded border border-slate-700/30"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {resource.status === 'found' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
              )}
              <span className="text-sm font-mono text-slate-200 truncate">{resource.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {resource.status === 'found' && resource.linesRead !== undefined ? (
                <span className="text-xs text-slate-400">{resource.linesRead} lines read</span>
              ) : (
                <span className="text-xs text-slate-500">Docs not found</span>
              )}
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

