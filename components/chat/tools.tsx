'use client'

import { getTemplateForStep } from '@/lib/agent-instructions'
import { Blueprint, BlueprintStep } from '@/lib/blueprints'
import { useInfraStore } from '@/lib/store'
import {
  useCopilotReadable,
  useFrontendTool,
  useHumanInTheLoop,
} from '@copilotkit/react-core'
import React from 'react'
import { BlueprintStepsCard } from './cards/BlueprintStepsCard'
import { FileProgressCard } from './cards/FileProgressCard'
import { ResourceDocsCard } from './cards/ResourceDocsCard'
import { StepCompletionCard } from './cards/StepCompletionCard'
import { StepConfirmationCard } from './cards/StepConfirmationCard'
import { StepRejectionCard } from './cards/StepRejectionCard'

export const useInfraTools = (blueprint: Blueprint) => {
  useCopilotReadable({
    description: 'Blueprint steps to execute. Use this data to call displayStepsList immediately when chat starts.',
    value: {
      ...blueprint,
      stepsForDisplay: blueprint.steps.map((step, idx) => ({
        number: idx + 1,
        title: step.title,
        type: step.type,
        moduleSource: step.moduleSource,
        workflowSteps: step.workflowSteps,
      })),
    },
  })

  useFrontendTool({
    name: 'displayStepsList',
    description:
      'Display all blueprint steps in a visual card. This is MANDATORY and must be called IMMEDIATELY when chat starts. Use the blueprint steps data provided in the instructions. Call this as your FIRST action when the chat begins.',
            parameters: [
              {
                name: 'steps',
                type: 'object[]',
                description: 'Array of blueprint steps with number, title, type, moduleSource, and workflowSteps',
                attributes: [
                  {
                    name: 'number',
                    type: 'number',
                    description: 'Step number (1, 2, 3, etc.)',
                    required: true,
                  },
                  {
                    name: 'title',
                    type: 'string',
                    description: 'Step title',
                    required: true,
                  },
                  {
                    name: 'type',
                    type: 'string',
                    description: 'Step type (terraform-module, terraform-environment, github-actions)',
                    required: true,
                  },
                  {
                    name: 'moduleSource',
                    type: 'string',
                    description: 'Module source (custom, public-registry, etc.)',
                    required: false,
                  },
                  {
                    name: 'workflowSteps',
                    type: 'number',
                    description: 'Number of workflow steps (for GitHub Actions)',
                    required: false,
                  },
                ],
              },
            ],
    render: ({ args }) => {
      if (!args.steps || args.steps.length === 0) {
        return <></>
      }
      return <BlueprintStepsCard steps={args.steps} />
    },
    handler: async ({ steps }) => {
      return `Displayed ${steps?.length || 0} blueprint steps`
    },
  })

  useFrontendTool({
    name: 'retrieveTemplates',
    description:
      'Retrieve Terraform templates for a blueprint step. Call this before writing files to get the template code. This will show a "Read resource documentation" card with resource status. After this, you should call writeToFile for EACH file separately (one at a time).',
    parameters: [
      {
        name: 'stepNumber',
        type: 'number',
        description: 'Step number',
        required: true,
      },
      {
        name: 'stepTitle',
        type: 'string',
        description: 'Step title',
        required: true,
      },
      {
        name: 'stepType',
        type: 'string',
        description: 'Step type (terraform-module, terraform-environment, github-actions)',
        required: true,
      },
      {
        name: 'moduleName',
        type: 'string',
        description: 'Module name for the step',
        required: false,
      },
      {
        name: 'resources',
        type: 'object[]',
        description: 'Array of resources being read (for documentation card)',
        required: false,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Resource name (e.g., "aws/db_instance", "random/password")',
            required: true,
          },
          {
            name: 'status',
            type: 'string',
            description: 'Resource status ("found" or "not-found")',
            required: true,
          },
          {
            name: 'linesRead',
            type: 'number',
            description: 'Number of lines read (only if status is "found")',
            required: false,
          },
        ],
      },
    ],
    render: ({ args, status }) => {
      // Show resource documentation card when resources are provided
      if (args.resources && Array.isArray(args.resources) && args.resources.length > 0) {
        return (
          <ResourceDocsCard
            resources={args.resources.map((r: { name?: string; status?: string; linesRead?: number }) => ({
              name: r.name || '',
              status: r.status === 'found' ? 'found' : 'not-found',
              linesRead: r.linesRead,
            }))}
          />
        )
      }

      // Fallback loading state
      if (status === 'inProgress' || status === 'executing') {
        return (
          <div className="border border-blue-500/30 rounded-lg bg-slate-900/50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-300">
                Reading templates for Step {args.stepNumber}: {args.stepTitle}...
              </span>
            </div>
          </div>
        )
      }

      return <></>
    },
    handler: async ({ stepNumber, stepTitle, stepType, moduleName, resources }) => {
      // Create a step object to use with getTemplateForStep
      const step: BlueprintStep = {
        id: stepNumber,
        title: stepTitle,
        type: stepType as 'terraform-module' | 'terraform-environment' | 'github-actions',
        description: '',
        moduleName: moduleName || stepTitle,
      }

      // Retrieve templates using getTemplateForStep
      const templates = getTemplateForStep(step)
      
      // Build clear message about available templates
      const availableTemplates: string[] = []
      if (templates.main) availableTemplates.push('main')
      if (templates.variables) availableTemplates.push('variables')
      if (templates.outputs) availableTemplates.push('outputs')
      
      const templateInfo = stepType === 'github-actions' 
        ? 'Templates available: main (workflow.yml)'
        : `Templates available: ${availableTemplates.join(', ')} (main.tf, variables.tf, outputs.tf)`
      
      return {
        templates,
        stepNumber,
        stepTitle,
        resources: resources || [],
        message: `Templates retrieved for Step ${stepNumber}: ${stepTitle}. ${templateInfo}. All templates are ready to use.`,
      }
    },
  })

  const responseRef = React.useRef<Map<string, { approved: boolean }>>(new Map())

  useHumanInTheLoop({
    name: 'requestStepConfirmation',
    description:
      'MANDATORY: You MUST call this tool IMMEDIATELY to show the confirmation card for each step. Do NOT ask verbally first - just call this tool directly. This tool will pause execution and wait for user to click the approval button. After user approves, you should say "I\'ll create the [module name] by adding the files" or similar, then call retrieveTemplates, then call writeToFile for EACH file separately (one at a time). ALWAYS call this before writing any files. Call this immediately after displayStepsList for Step 1, and immediately after each markStepComplete for the next step. Continue through ALL steps - do NOT stop after step 2 or 3.',
    parameters: [
      {
        name: 'stepNumber',
        type: 'number',
        description: 'Step number',
        required: true,
      },
      {
        name: 'stepTitle',
        type: 'string',
        description: 'Step title',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Step description',
        required: true,
      },
      {
        name: 'moduleName',
        type: 'string',
        description: 'Module name (e.g., "vpc", "rds-postgres")',
        required: false,
      },
      {
        name: 'moduleSource',
        type: 'string',
        description: 'Module source (e.g., "Custom Module", "Public Registry")',
        required: false,
      },
      {
        name: 'keyRequirements',
        type: 'string[]',
        description: 'Array of key requirements for this step',
        required: false,
      },
    ],
    render: (props) => {
      const { args, status } = props
      const stepKey = `step-${args.stepNumber}`
      
      if (status === 'executing' && 'respond' in props && typeof props.respond === 'function') {
        const respond = props.respond
        return (
          <StepConfirmationCard
            step={args}
            onConfirm={async () => {
              responseRef.current.set(stepKey, { approved: true })
              await respond({ approved: true })
            }}
            onCancel={async () => {
              responseRef.current.set(stepKey, { approved: false })
              await respond({ approved: false })
            }}
          />
        )
      }

      if (status === 'inProgress') {
        return (
          <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-300">Preparing step confirmation...</span>
            </div>
          </div>
        )
      }

      if (status === 'complete') {
        const response = responseRef.current.get(stepKey)
        if (response && response.approved === false) {
          return <StepRejectionCard stepNumber={args.stepNumber} stepTitle={args.stepTitle} />
        }
        // Don't show approval message - agent will proceed with file creation
        return <></>
      }

      return <></>
    },
  })

  useFrontendTool({
    name: 'createFile',
    description: 'Create a new file in the project tree. This is called internally - writeToFile will handle the UI display.',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path',
        required: true,
      },
    ],
    handler: async ({ path }) => {
      const store = useInfraStore.getState()
      store.createFile(path)
      return `File created: ${path}`
    },
    render: () => <></>,
  })

  const WriteToFileRenderer = ({ args, status }: { args: { path: string; content: string }; status: string }) => {
    const { createFile, streamContent, completeFile, selectFile, files } = useInfraStore()
    const prevContentRef = React.useRef<string>('')
    const hasCompletedRef = React.useRef<boolean>(false)
    const filePathRef = React.useRef<string | null>(null)
    const hasCreatedRef = React.useRef<boolean>(false)

    React.useEffect(() => {
      if (args.path && filePathRef.current !== args.path) {
        filePathRef.current = args.path
        hasCreatedRef.current = false
        prevContentRef.current = ''
        hasCompletedRef.current = false
      }

      if (args.path && !hasCreatedRef.current) {
        const fileExists = files.some((f) => f.path === args.path)
        if (!fileExists) {
          setTimeout(() => {
            createFile(args.path)
            hasCreatedRef.current = true
          }, 0)
        } else {
          setTimeout(() => selectFile(args.path), 0)
          hasCreatedRef.current = true
        }
      }
    }, [args.path, files, createFile, selectFile])

    React.useEffect(() => {
      if (args.path && args.content && args.content !== prevContentRef.current && hasCreatedRef.current) {
        setTimeout(() => {
          selectFile(args.path)
          streamContent(args.path, args.content)
        }, 0)
        prevContentRef.current = args.content
      }
    }, [args.path, args.content, streamContent, selectFile])

    React.useEffect(() => {
      if (status === 'complete' && args.path && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        setTimeout(() => completeFile(args.path), 0)
      }
    }, [status, args.path, completeFile])

    if (!args.path || (!args.content && status !== 'complete')) {
      return <></>
    }

    return (
      <div key={args.path}>
        <FileProgressCard path={args.path} status={status === 'complete' ? 'complete' : 'writing'} />
      </div>
    )
  }

  useFrontendTool({
    name: 'writeToFile',
    description:
      'Write content to a SINGLE file. CRITICAL: Call this for ONE file at a time. Wait for this tool to complete (status becomes "complete") before calling it again for the next file. The file will appear in the file tree, be automatically selected, and content will stream live to Monaco editor. Do NOT call this for multiple files simultaneously.',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path (e.g., "infra/modules/vpc/main.tf")',
        required: true,
      },
      {
        name: 'content',
        type: 'string',
        description: 'File content (streams in partial chunks)',
        required: true,
      },
    ],

    render: (props) => {
      const { args, status } = props
      if (!args?.path) return <></>
      return <WriteToFileRenderer args={args as { path: string; content: string }} status={status} />
    },

    handler: async ({ path }) => {
      const store = useInfraStore.getState()
      if (!store.files.some((f) => f.path === path)) {
        store.createFile(path)
      }
      store.selectFile(path)
      await new Promise((resolve) => setTimeout(resolve, 200))
      return `✓ File written successfully: ${path}\n\nIMPORTANT: Wait for this message, then call writeToFile for the NEXT file. For Terraform steps, you MUST write ALL THREE files: main.tf, variables.tf, outputs.tf. Do NOT stop after main.tf!`
    },
  })

  useFrontendTool({
    name: 'markStepComplete',
    description:
      'MANDATORY: Call this tool after ALL THREE files (main.tf, variables.tf, outputs.tf) for a step are written. This displays a success card. You MUST call this after writing ALL THREE files. Then IMMEDIATELY call requestStepConfirmation for the next step.',
    parameters: [
      {
        name: 'moduleName',
        type: 'string',
        description: 'Module name (e.g., "VPC module", "DynamoDB Table Module", "Lambda API Module")',
        required: true,
      },
      {
        name: 'stepNumber',
        type: 'number',
        description: 'Step number that was completed',
        required: false,
      },
    ],
    render: ({ args }) => {
      if (!args.moduleName) {
        return <></>
      }
      return (
        <StepCompletionCard
          moduleName={args.moduleName}
          stepNumber={args.stepNumber}
        />
      )
    },
    handler: async ({ moduleName }) => {
      return `${moduleName} created successfully. IMMEDIATELY call requestStepConfirmation for the next step. Continue through ALL steps.`
    },
  })

}

