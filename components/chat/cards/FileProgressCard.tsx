'use client'

import { CheckCircle2, Loader2, File } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInfraStore } from '@/lib/store'

interface FileProgressCardProps {
  path: string
  status: 'creating' | 'writing' | 'complete' | 'created'
}

export const FileProgressCard = ({ path, status }: FileProgressCardProps) => {
  const selectFile = useInfraStore((state) => state.selectFile)
  
  const handleClick = () => {
    // Only make clickable when file is complete
    if (status === 'complete' || status === 'created') {
      selectFile(path)
    }
  }
  const getIcon = () => {
    switch (status) {
      case 'creating':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case 'writing':
        return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
      case 'complete':
      case 'created':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </motion.div>
        )
      default:
        return <File className="h-4 w-4 text-slate-400" />
    }
  }

  const getFileName = () => {
    const parts = path.split('/')
    return parts[parts.length - 1] || path
  }

  const getStatusText = () => {
    switch (status) {
      case 'creating':
        return 'Creating file'
      case 'writing':
        return 'Writing'
      case 'complete':
        return getFileName() // Show filename instead of "Edited file"
      case 'created':
        return getFileName() // Show filename instead of "Created file"
      default:
        return 'Processing'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'creating':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'writing':
        return 'border-amber-500/30 bg-amber-500/5'
      case 'complete':
      case 'created':
        return 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 hover:border-emerald-500/40 hover:from-emerald-500/10 hover:to-teal-500/10'
      default:
        return 'border-slate-700/50 bg-slate-800/50'
    }
  }

  const isClickable = status === 'complete' || status === 'created'

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${getStatusColor()} transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] group'
          : 'cursor-default'
      }`}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 font-mono">
            {getStatusText()}
          </span>
        </div>
        {/* Always show path for context, especially when complete to differentiate modules */}
        <p className="text-xs font-mono text-slate-400 truncate mt-0.5">{path}</p>
      </div>
      {(status === 'complete' || status === 'created') && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0"
        >
          <span className="text-emerald-400 text-lg group-hover:text-emerald-300 transition-colors">
            →
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

