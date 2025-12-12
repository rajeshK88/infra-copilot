'use client'

import Link from 'next/link'
import { Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react'
import { Blueprint } from '@/lib/blueprints'
import { motion } from 'framer-motion'

interface BlueprintCardProps {
  blueprint: Blueprint
  index: number
}

export const BlueprintCard = ({ blueprint, index }: BlueprintCardProps) => {
  const getProviderTheme = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return {
          gradient: 'from-orange-500/20 via-orange-600/15 to-orange-700/10',
          border: 'border-orange-500/30',
          hoverBorder: 'group-hover:border-orange-500/60',
          glow: 'group-hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]',
          badge:
            'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-200 border-orange-500/40',
          icon: 'text-orange-400',
        }
      case 'Google Cloud':
        return {
          gradient: 'from-blue-500/20 via-blue-600/15 to-blue-700/10',
          border: 'border-blue-500/30',
          hoverBorder: 'group-hover:border-blue-500/60',
          glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
          badge:
            'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-200 border-blue-500/40',
          icon: 'text-blue-400',
        }
      case 'Azure':
        return {
          gradient: 'from-cyan-500/20 via-cyan-600/15 to-cyan-700/10',
          border: 'border-cyan-500/30',
          hoverBorder: 'group-hover:border-cyan-500/60',
          glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]',
          badge:
            'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-200 border-cyan-500/40',
          icon: 'text-cyan-400',
        }
      default:
        return {
          gradient: 'from-purple-500/20 via-purple-600/15 to-purple-700/10',
          border: 'border-purple-500/30',
          hoverBorder: 'group-hover:border-purple-500/60',
          glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
          badge:
            'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 border-purple-500/40',
          icon: 'text-purple-400',
        }
    }
  }

  const theme = getProviderTheme(blueprint.cloudProvider)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="h-full"
    >
      <Link href={`/blueprints/${blueprint.slug}`} className="block h-full">
        <div
          className={`
            group relative h-full overflow-hidden rounded-3xl border bg-gradient-to-br
            bg-slate-900/50 backdrop-blur-xl p-8 transition-all duration-500
            hover:scale-[1.03] hover:-translate-y-1
            ${theme.gradient} ${theme.border} ${theme.hoverBorder} ${theme.glow}
          `}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Provider Badge */}
            <div className="mb-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${theme.badge}`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${theme.icon}`} />
                {blueprint.cloudProvider}
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-4 text-2xl font-bold leading-tight text-white transition-colors">
              {blueprint.name}
            </h3>

            {/* Description */}
            <p className="mb-6 text-base leading-relaxed text-slate-300">{blueprint.description}</p>

            {/* Metadata Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm transition-all group-hover:bg-slate-800/70 group-hover:border-slate-600/50">
                <div className="mb-1.5 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Setup
                  </span>
                </div>
                <div className="text-lg font-bold text-white">{blueprint.setupTime}</div>
              </div>
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm transition-all group-hover:bg-slate-800/70 group-hover:border-slate-600/50">
                <div className="mb-1.5 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Cost
                  </span>
                </div>
                <div className="text-lg font-bold text-white">{blueprint.cost}</div>
              </div>
            </div>

            {/* Technologies */}
            <div className="mb-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Technologies
              </div>
              <div className="flex flex-wrap gap-2">
                {blueprint.technologies.map((tech, idx) => {
                  return (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition-all group-hover:bg-slate-800/80 group-hover:border-slate-600/50"
                    >
                      {tech}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-800/40 border border-slate-700/50 px-5 py-3 backdrop-blur-sm transition-all group-hover:from-slate-800/80 group-hover:to-slate-800/60 group-hover:border-slate-600/50">
                <span className="text-sm font-semibold text-white">View Blueprint</span>
                <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
