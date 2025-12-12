import { BlueprintList } from '@/components/blueprint-list'
import { getAllBlueprints } from '@/lib/blueprints'
import { Code2, Sparkles } from 'lucide-react'

const HomePage = () => {
  const blueprints = getAllBlueprints()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Infra Copilot
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="#blueprints"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Blueprints
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AI-Powered Infrastructure</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Production-ready
            </span>
            <br />
            <span className="text-white">infrastructure in minutes</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400">
            Generate Terraform, Kubernetes, and CI/CD configurations using step-by-step Blueprints.
            Deploy to AWS, GCP, or Azure with confidence.
          </p>
        </div>
      </section>

      {/* Blueprints Section */}
      <section id="blueprints" className="container mx-auto px-6 pb-24">
        <BlueprintList blueprints={blueprints} />
      </section>
    </div>
  )
}

export default HomePage
