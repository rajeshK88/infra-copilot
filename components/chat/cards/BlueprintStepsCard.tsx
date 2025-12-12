'use client'

import { ChevronDown, GitBranch } from 'lucide-react'
import { motion } from 'framer-motion'

interface Step {
  number?: number
  title?: string
  type?: string
  moduleSource?: string
  workflowSteps?: number
}

interface BlueprintStepsCardProps {
  steps: Step[]
}

// Terraform Icon - Simplified version of the official logo
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

const getStepTypeIcon = (type?: string) => {
  if (!type) return null
  if (type === 'terraform-module' || type === 'terraform-environment') {
    return <TerraformIcon className="h-3.5 w-3.5" />
  }
  if (type.includes('github') || type.includes('action')) {
    return <GitBranch className="h-3.5 w-3.5" />
  }
  return null
}

const getStepTypeLabel = (type?: string): string => {
  if (!type) return ''
  if (type === 'terraform-module') return 'TERRAFORM MODULE'
  if (type === 'terraform-environment') return 'TERRAFORM ENVIRONMENT'
  if (type === 'github-actions') return 'GITHUB ACTIONS'
  return type.toUpperCase().replace(/-/g, ' ')
}

const getStepTypeColor = (type?: string) => {
  if (!type) return 'text-blue-400'
  if (type.includes('terraform-module')) return 'text-blue-400'
  if (type.includes('terraform-environment')) return 'text-green-400'
  if (type.includes('github') || type.includes('action')) return 'text-blue-400'
  return 'text-blue-400'
}

const getStepDetails = (step: Step): { label: string; pill?: string } => {
  if (step.moduleSource) {
    return {
      label: step.moduleSource === 'custom' ? 'Custom Module' : 'Public Registry',
      pill: '3 requirements', // Default - could be dynamic
    }
  }
  if (step.type === 'terraform-environment') {
    return {
      label: 'small scale',
      pill: 's3 backend',
    }
  }
  if (step.type === 'github-actions' && step.workflowSteps) {
    return {
      label: `${step.workflowSteps} steps`,
    }
  }
  return {
    label: 'Custom Module',
    pill: '3 requirements',
  }
}

export const BlueprintStepsCard = ({ steps }: BlueprintStepsCardProps) => {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-slate-700/50 rounded-lg bg-slate-900/50 p-3 space-y-2"
    >
      {steps.map((step, index) => {
        const stepNum = step.number || index + 1
        const Icon = getStepTypeIcon(step.type)
        const iconColor = getStepTypeColor(step.type)
        const typeLabel = getStepTypeLabel(step.type)
        const details = getStepDetails(step)

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center gap-3 py-2.5 px-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/40 transition-all group cursor-pointer"
          >
            {/* Step Number */}
            <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
              <span className="text-xs font-semibold text-slate-200">{stepNum}</span>
            </div>

            {/* Icon */}
            <div className={`flex-shrink-0 ${iconColor} flex items-center`}>{Icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              {/* Type Label */}
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {typeLabel}
              </div>

              {/* Title */}
              <div className="text-sm font-semibold text-white">{step.title || 'Untitled'}</div>

              {/* Details Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">{details.label}</span>
                {details.pill && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    {details.pill}
                  </span>
                )}
              </div>
            </div>

            {/* Chevron */}
            <div className="flex-shrink-0">
              <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

