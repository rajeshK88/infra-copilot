'use client'

import { Blueprint } from '@/lib/blueprints'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Clock, Code2, DollarSign, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface BlueprintDetailProps {
  blueprint: Blueprint
}

export const BlueprintDetail = ({ blueprint }: BlueprintDetailProps) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (stepId: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'terraform-environment':
        return '🌍'
      case 'terraform-module':
        return '📦'
      case 'github-actions':
        return '⚙️'
      default:
        return '📋'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Infra Copilot
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Blueprints
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            /
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-white transition-colors">
            Blueprints
          </Link>
          <span>/</span>
          <span className="text-slate-300">{blueprint.slug}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Help Text */}
            <div className="mb-6">
              <Link
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                What are blueprints?
              </Link>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">{blueprint.name}</h1>
              <p className="mb-8 text-lg text-slate-300 leading-relaxed">{blueprint.description}</p>
            </motion.div>

            {/* Blueprint Steps */}
            <div className="mb-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Blueprint Steps</h2>
              <p className="mb-6 text-sm text-slate-400">Expand the steps below to customize</p>

              <div className="space-y-4">
                {blueprint.steps.map((step, index) => {
                  const isExpanded = expandedSteps.has(step.id)
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                            {step.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getStepIcon(step.type)}</span>
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                {step.description}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                            {step.moduleName && (
                              <p className="text-sm text-slate-400 mt-1">{step.moduleName}</p>
                            )}
                            {step.workflowName && (
                              <p className="text-sm text-slate-400 mt-1">{step.workflowName}</p>
                            )}
                            {step.workflowSteps && (
                              <p className="text-sm text-slate-400 mt-1">
                                {step.workflowSteps} steps
                              </p>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/30">
                              <p className="text-sm text-slate-400">
                                Step configuration options will be available here. This is where
                                users can customize the{' '}
                                {step.type === 'terraform-environment'
                                  ? 'Terraform environment'
                                  : step.type === 'terraform-module'
                                    ? 'Terraform module'
                                    : 'GitHub Actions workflow'}
                                .
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Attach Source Code Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Attach Source Code (Optional)
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                  Connect GitHub
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                  Connect GitLab
                </button>
                <button className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                  Upload ZIP File
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6">
                <h2 className="mb-6 text-xl font-bold text-white">Blueprint Overview</h2>

                {/* Cost */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="mb-2 text-sm font-medium text-slate-400">Cost</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <span className="text-xl font-bold text-white">{blueprint.cost}</span>
                  </div>
                </div>

                {/* Setup Time */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="mb-2 text-sm font-medium text-slate-400">Setup Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-xl font-bold text-white">{blueprint.setupTime}</span>
                  </div>
                </div>

                {/* Technologies */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="mb-3 text-sm font-medium text-slate-400">Technologies</div>
                  <div className="flex flex-wrap gap-2">
                    {blueprint.technologies.map((tech, idx) => {
                      return (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-200"
                        >
                          {tech}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* What You'll Build */}
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-white">What You&apos;ll Build</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{blueprint.whatYouBuild}</p>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/chat/${blueprint.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  <MessageSquare className="h-5 w-5" />
                  Start Chat with Blueprint
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
