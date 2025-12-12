'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Play, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface StepConfirmationCardProps {
  step: {
    stepNumber?: number
    stepTitle?: string
    description?: string
    moduleName?: string
    moduleSource?: string
    keyRequirements?: string[]
  }
  onConfirm: () => void
  onCancel: () => void
}

export const StepConfirmationCard = ({
  step,
  onConfirm,
  onCancel,
}: StepConfirmationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="border border-yellow-500/30 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-800/50 p-4 space-y-3 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20 animate-ping" />
          </div>
          <span className="text-xs font-medium text-yellow-400 uppercase tracking-wide">
            Awaiting Approval
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs text-slate-400">Step</span>
          <span className="text-xs font-semibold text-white">{step.stepNumber || '?'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-0.5">
              Continue with step {step.stepNumber}: {step.stepTitle || 'Untitled Step'}
            </h3>
            {step.description && (
              <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
            )}
          </div>
        </div>

        {/* Details Section */}
        {(step.moduleName || step.moduleSource || step.keyRequirements) && (
          <div className="bg-slate-800/30 rounded-md p-2.5 border border-slate-700/50 space-y-1.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Details:
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              {step.moduleName && (
                <div>
                  <span className="text-slate-400">Module:</span>{' '}
                  <span className="font-mono text-slate-200">{step.moduleName}</span>
                </div>
              )}
              {step.moduleSource && (
                <div>
                  <span className="text-slate-400">Source:</span>{' '}
                  <span className="text-slate-200">{step.moduleSource}</span>
                </div>
              )}
              {step.keyRequirements && step.keyRequirements.length > 0 && (
                <div>
                  <div className="text-slate-400 mb-0.5 text-xs">Key requirements:</div>
                  <ul className="list-disc list-inside space-y-0.5 ml-2 text-slate-300">
                    {step.keyRequirements.map((req, idx) => (
                      <li key={idx} className="font-mono text-xs">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-slate-800/30 rounded-md p-2.5 border border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>This step will create infrastructure files. Review and approve to continue.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          size="sm"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20 transition-all"
        >
          <Play className="h-4 w-4 mr-2" />
          Approve & Continue
        </Button>
      </div>
    </motion.div>
  )
}

