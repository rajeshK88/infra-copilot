'use client'

import { XCircle, MessageSquare, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface StepRejectionCardProps {
  stepNumber?: number
  stepTitle?: string
}

export const StepRejectionCard = ({ stepNumber, stepTitle }: StepRejectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="border border-red-400/40 rounded-lg bg-gradient-to-br from-red-500/20 via-red-500/10 to-slate-900/80 p-4 space-y-3 shadow-lg backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="p-2 rounded-full bg-red-500/30 border border-red-400/50"
          >
            <XCircle className="h-4 w-4 text-red-300" />
          </motion.div>
          <span className="text-xs font-medium text-red-300 uppercase tracking-wide">
            Step Rejected
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs text-slate-400">Step</span>
          <span className="text-xs font-semibold text-white">{stepNumber || '?'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <XCircle className="h-5 w-5 text-red-300 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">
              Step {stepNumber}: {stepTitle || 'Untitled Step'} was rejected
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              This step will not be executed. The infrastructure build has been paused.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-red-500/10 rounded-md p-3 border border-red-400/30">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-4 w-4 text-red-300 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-slate-200 font-medium">
                Want to try again?
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you&apos;d like to proceed with this step or modify the requirements, simply send a message in the chat below. I&apos;ll be ready to help you continue when you&apos;re ready.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <ArrowRight className="h-3.5 w-3.5 text-red-300" />
                <span className="text-xs text-slate-300 font-mono">
                  Type your message below to retry
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

