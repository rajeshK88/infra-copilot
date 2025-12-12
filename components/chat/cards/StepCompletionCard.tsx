'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Rocket } from 'lucide-react'

interface StepCompletionCardProps {
  moduleName: string
  stepNumber?: number
}

export const StepCompletionCard = ({ moduleName, stepNumber }: StepCompletionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-blue-500/30 rounded-lg bg-gradient-to-br from-blue-500/10 via-slate-900/90 to-slate-800/50 p-4 space-y-3 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
          className="p-2 rounded-full bg-blue-500/20 border border-blue-500/30"
        >
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">
            {moduleName} created successfully
          </h3>
          {stepNumber && (
            <p className="text-xs text-slate-400 mt-0.5">Step {stepNumber} completed</p>
          )}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Rocket className="h-5 w-5 text-blue-400" />
        </motion.div>
      </div>
    </motion.div>
  )
}

