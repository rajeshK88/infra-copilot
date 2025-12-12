import { getTemplateForStep } from '@/lib/agent-instructions'
import { Blueprint } from '@/lib/blueprints'
import { useInfraStore } from '@/lib/store'
import { useCopilotReadable, useFrontendTool, useHumanInTheLoop } from '@copilotkit/react-core'
import { render, renderHook } from '@testing-library/react'
import React from 'react'
import { useInfraTools } from '../tools'

jest.mock('@/lib/store', () => ({
  useInfraStore: jest.fn(),
}))

jest.mock('@copilotkit/react-core', () => ({
  useCopilotReadable: jest.fn(),
  useFrontendTool: jest.fn(),
  useHumanInTheLoop: jest.fn(),
}))

jest.mock('@/lib/agent-instructions', () => ({
  getTemplateForStep: jest.fn(),
}))

const mockBlueprint: Blueprint = {
  id: '1',
  slug: 'test',
  name: 'Test Blueprint',
  description: 'Test',
  cost: '$10',
  setupTime: '5 min',
  technologies: ['Terraform'],
  category: 'Web',
  cloudProvider: 'AWS',
  whatYouBuild: 'Test',
  steps: [
    {
      id: 1,
      title: 'VPC Module',
      type: 'terraform-module',
      description: 'VPC',
      moduleName: 'vpc',
    },
  ],
}

// Helper functions
const getMockStore = () => ({
  createFile: jest.fn(),
  streamContent: jest.fn(),
  completeFile: jest.fn(),
  selectFile: jest.fn(),
  files: [],
})

type ToolConfig = {
  name: string
  handler?: (...args: unknown[]) => Promise<unknown>
  render?: (props: unknown) => React.ReactElement | null
}

const getHandler = (toolName: string): ((...args: unknown[]) => Promise<unknown>) | undefined => {
  let handler: ((...args: unknown[]) => Promise<unknown>) | undefined
  ;(useFrontendTool as jest.Mock).mockImplementation((config: ToolConfig) => {
    if (config.name === toolName) {
      handler = config.handler
    }
  })
  renderHook(() => useInfraTools(mockBlueprint))
  return handler
}

const getRenderFn = (toolName: string): ((props: unknown) => React.ReactElement | null) | undefined => {
  let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
  ;(useFrontendTool as jest.Mock).mockImplementation((config: ToolConfig) => {
    if (config.name === toolName) {
      renderFn = config.render
    }
  })
  renderHook(() => useInfraTools(mockBlueprint))
  return renderFn
}

const getHumanInTheLoopRenderFn = (): ((props: unknown) => React.ReactElement | null) | undefined => {
  let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
  ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
    renderFn = config.render
  })
  renderHook(() => useInfraTools(mockBlueprint))
  return renderFn
}

describe('useInfraTools', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useInfraStore as unknown as jest.Mock).mockReturnValue(getMockStore())
    ;(getTemplateForStep as jest.Mock).mockReturnValue({
      main: 'main template',
      variables: 'variables template',
      outputs: 'outputs template',
    })
  })

  describe('Tool Registration', () => {
    it('should register all tools and blueprint data', () => {
      renderHook(() => useInfraTools(mockBlueprint))
      
      // Check all hooks are called
      expect(useCopilotReadable).toHaveBeenCalled()
      expect(useFrontendTool).toHaveBeenCalled()
      expect(useHumanInTheLoop).toHaveBeenCalled()
      
      // Check blueprint data registration
      expect(useCopilotReadable).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Blueprint steps'),
          value: expect.objectContaining({ id: '1', name: 'Test Blueprint' }),
        })
      )
      
      // Check all tool registrations
      const calls = (useFrontendTool as jest.Mock).mock.calls
      const toolNames = ['displayStepsList', 'retrieveTemplates', 'createFile', 'writeToFile', 'markStepComplete']
      toolNames.forEach((toolName) => {
        const call = calls.find((c: ToolConfig[]) => c[0]?.name === toolName)
        expect(call).toBeDefined()
      })
      
      // Check specific tool descriptions
      expect(calls.find((c: ToolConfig[]) => c[0]?.name === 'displayStepsList')?.[0]?.description).toContain('Display all blueprint steps')
      expect(calls.find((c: ToolConfig[]) => c[0]?.name === 'retrieveTemplates')?.[0]?.description).toContain('Retrieve Terraform templates')
      expect(calls.find((c: ToolConfig[]) => c[0]?.name === 'createFile')?.[0]?.description).toContain('Create a new file')
      expect(calls.find((c: ToolConfig[]) => c[0]?.name === 'writeToFile')?.[0]?.description).toContain('Write content to a SINGLE file')
      expect(calls.find((c: ToolConfig[]) => c[0]?.name === 'markStepComplete')?.[0]?.description).toContain('MANDATORY')
      
      // Check human-in-the-loop tool
      expect(useHumanInTheLoop).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'requestStepConfirmation',
          description: expect.stringContaining('MANDATORY'),
        })
      )
    })
  })

  describe('displayStepsList', () => {
    it('should handle steps with correct count (including steps?.length || 0 fallback)', async () => {
      const handler = getHandler('displayStepsList')
      
      // Test with steps
      const result1 = await handler?.({ steps: [{ number: 1, title: 'Step 1' }] })
      expect(result1).toContain('Displayed 1 blueprint steps')
      
      // Test fallback cases (undefined, null, empty array)
      const testCases = [undefined, null, []]
      for (const testCase of testCases) {
        const result = await handler?.({ steps: testCase })
        expect(result).toBe('Displayed 0 blueprint steps')
      }
    })
  })

  describe('retrieveTemplates', () => {
    const defaultParams = {
      stepNumber: 1,
      stepTitle: 'VPC',
      stepType: 'terraform-module' as const,
      moduleName: 'vpc',
    }

    it('should retrieve templates', async () => {
      const handler = getHandler('retrieveTemplates')
      const result = (await handler?.(defaultParams)) as { templates?: unknown; message?: string }
      expect(result?.templates).toBeDefined()
      expect(result?.message).toContain('Templates retrieved')
    })

    it('should use stepTitle when moduleName is falsy', async () => {
      const handler = getHandler('retrieveTemplates')
      const result = (await handler?.({ ...defaultParams, moduleName: undefined })) as { templates?: unknown }
      expect(result?.templates).toBeDefined()
    })

    it('should handle github-actions type', async () => {
      const handler = getHandler('retrieveTemplates')
      const result = (await handler?.({
        ...defaultParams,
        stepType: 'github-actions',
        stepTitle: 'CI/CD',
      })) as { message?: string }
      expect(result?.message).toContain('workflow.yml')
    })

    describe('Template availability conditions', () => {
      const testTemplateCondition = async (
        templates: { main?: string | null; variables?: string | null; outputs?: string | null },
        expectedInMessage: string[],
        expectedNotInMessage: string[]
      ): Promise<void> => {
        ;(getTemplateForStep as jest.Mock).mockReturnValue(templates)
        const handler = getHandler('retrieveTemplates')
        const result = (await handler?.(defaultParams)) as { message?: string }
        expectedInMessage.forEach((text) => {
          expect(result?.message).toMatch(new RegExp(text))
        })
        expectedNotInMessage.forEach((text) => {
          expect(result?.message).not.toMatch(new RegExp(text))
        })
      }

      it('should handle all templates', async () => {
        await testTemplateCondition(
          { main: 'main', variables: 'vars', outputs: 'outs' },
          ['main', 'variables', 'outputs'],
          []
        )
      })

      it('should handle missing main template', async () => {
        await testTemplateCondition(
          { main: undefined, variables: 'vars', outputs: 'outs' },
          ['variables', 'outputs'],
          ['main, variables', 'main, outputs']
        )
      })

      it('should handle missing variables template', async () => {
        await testTemplateCondition(
          { main: 'main', variables: undefined, outputs: 'outs' },
          ['main', 'outputs'],
          ['main, variables', 'variables, main']
        )
      })

      it('should handle missing outputs template', async () => {
        await testTemplateCondition(
          { main: 'main', variables: 'vars', outputs: undefined },
          ['main', 'variables'],
          ['main, outputs', 'outputs, main']
        )
      })

      it('should handle falsy main template values (null and empty string)', async () => {
        const testCases = [
          { main: null, variables: 'vars', outputs: 'outs' },
          { main: '', variables: 'vars', outputs: 'outs' },
        ]
        for (const templates of testCases) {
          await testTemplateCondition(
            templates,
            ['variables', 'outputs'],
            ['main, variables', 'main, outputs']
          )
        }
      })
    })
  })

  describe('createFile', () => {
    it('should create file', async () => {
      const mockCreateFile = jest.fn()
      const mockGetState = jest.fn(() => ({
        createFile: mockCreateFile,
        files: [],
      }))
      const storeMock = useInfraStore as unknown as jest.Mock & { getState: jest.Mock }
      storeMock.getState = mockGetState
      const handler = getHandler('createFile')
      const result = (await handler?.({ path: 'test.tf' })) as string
      expect(mockCreateFile).toHaveBeenCalledWith('test.tf')
      expect(result).toContain('File created')
    })
  })

  describe('writeToFile handler', () => {
    it('should create file if not exists', async () => {
      const mockCreateFile = jest.fn()
      const mockSelectFile = jest.fn()
      const mockGetState = jest.fn(() => ({
        createFile: mockCreateFile,
        selectFile: mockSelectFile,
        files: [],
      }))
      const storeMock = useInfraStore as unknown as jest.Mock & { getState: jest.Mock }
      storeMock.getState = mockGetState
      const handler = getHandler('writeToFile')
      await handler?.({ path: 'test.tf' })
      expect(mockCreateFile).toHaveBeenCalledWith('test.tf')
      expect(mockSelectFile).toHaveBeenCalledWith('test.tf')
    })

    it('should not create file if exists', async () => {
      const mockCreateFile = jest.fn()
      const mockSelectFile = jest.fn()
      const mockGetState = jest.fn(() => ({
        createFile: mockCreateFile,
        selectFile: mockSelectFile,
        files: [{ path: 'test.tf', content: '', status: 'creating' }],
      }))
      const storeMock = useInfraStore as unknown as jest.Mock & { getState: jest.Mock }
      storeMock.getState = mockGetState
      const handler = getHandler('writeToFile')
      await handler?.({ path: 'test.tf' })
      expect(mockCreateFile).not.toHaveBeenCalled()
      expect(mockSelectFile).toHaveBeenCalledWith('test.tf')
    })
  })

  describe('markStepComplete', () => {
    it('should mark step complete', async () => {
      const handler = getHandler('markStepComplete')
      const result = (await handler?.({ moduleName: 'VPC Module', stepNumber: 1 })) as string
      expect(result).toContain('created successfully')
    })
  })
})

describe('useInfraTools - Render Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useInfraStore as unknown as jest.Mock).mockReturnValue(getMockStore())
    ;(getTemplateForStep as jest.Mock).mockReturnValue({
      main: 'main template',
      variables: 'variables template',
      outputs: 'outputs template',
    })
  })

  describe('displayStepsList render', () => {
    it('should return empty for empty/null steps', () => {
      const renderFn = getRenderFn('displayStepsList')
      const result1 = renderFn?.({ args: { steps: [] }, status: 'complete' })
      const result2 = renderFn?.({ args: { steps: null }, status: 'complete' })
      expect(render(result1 as React.ReactElement).container.firstChild).toBeNull()
      expect(render(result2 as React.ReactElement).container.firstChild).toBeNull()
    })

    it('should render BlueprintStepsCard when steps exist', () => {
      const renderFn = getRenderFn('displayStepsList')
      const result = renderFn?.({
        args: { steps: [{ number: 1, title: 'Step 1', type: 'terraform-module' }] },
        status: 'complete',
      })
      expect(render(result as React.ReactElement).container).toBeInTheDocument()
    })

    it('should handle handler', async () => {
      const handler = getHandler('displayStepsList')
      const result = (await handler?.({ steps: [{ number: 1 }] })) as string
      expect(result).toContain('Displayed 1 blueprint steps')
    })
  })

  describe('retrieveTemplates render', () => {
    it('should render ResourceDocsCard when resources provided', () => {
      const renderFn = getRenderFn('retrieveTemplates')
      const result = renderFn?.({
        args: {
          stepNumber: 1,
          stepTitle: 'Step 1',
          stepType: 'terraform-module',
          resources: [{ name: 'aws/vpc', status: 'found', linesRead: 100 }],
        },
        status: 'complete',
      })
      expect(render(result as React.ReactElement).container).toBeInTheDocument()
    })

    it('should render loading state', () => {
      const renderFn = getRenderFn('retrieveTemplates')
      const result1 = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1', stepType: 'terraform-module' }, status: 'inProgress' })
      const result2 = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1', stepType: 'terraform-module' }, status: 'executing' })
      expect(render(result1 as React.ReactElement).container.textContent).toContain('Reading templates')
      expect(render(result2 as React.ReactElement).container.textContent).toContain('Reading templates')
    })

    it('should return empty when no resources and not loading', () => {
      const renderFn = getRenderFn('retrieveTemplates')
      const result = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1', stepType: 'terraform-module' }, status: 'complete' })
      expect(result).toEqual(<></>)
    })

    it('should handle resource edge cases', () => {
      const renderFn = getRenderFn('retrieveTemplates')
      const testCases = [
        { name: undefined, status: 'found' },
        { name: null, status: 'found' },
        { name: '', status: 'found' },
        { name: 'aws/vpc', status: 'not-found' },
        { name: 'aws/vpc', status: undefined },
      ]
      testCases.forEach((testCase) => {
        const result = renderFn?.({
          args: {
            stepNumber: 1,
            stepTitle: 'Step 1',
            stepType: 'terraform-module',
            resources: [{ name: testCase.name as string, status: testCase.status as string, linesRead: 100 }],
          },
          status: 'complete',
        })
        expect(render(result as React.ReactElement).container).toBeInTheDocument()
      })
    })
  })

  describe('requestStepConfirmation render', () => {
    it('should render StepConfirmationCard when executing', async () => {
      const mockRespond = jest.fn().mockResolvedValue(undefined)
      let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
      ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
        renderFn = config.render
      })
      renderHook(() => useInfraTools(mockBlueprint))
      const result = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1', description: 'Test' }, status: 'executing', respond: mockRespond })
      const container = render((result || <></>) as React.ReactElement).container
      expect(container).toBeInTheDocument()
      const approveButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent?.toLowerCase().includes('approve'))
      approveButton?.click()
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(mockRespond).toHaveBeenCalledWith({ approved: true })
    })

    it('should handle cancel callback', async () => {
      const mockRespond = jest.fn().mockResolvedValue(undefined)
      let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
      ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
        renderFn = config.render
      })
      renderHook(() => useInfraTools(mockBlueprint))
      const result = renderFn?.({ args: { stepNumber: 3, stepTitle: 'Step 3', description: 'Test' }, status: 'executing', respond: mockRespond })
      const container = render(result as React.ReactElement).container
      const cancelButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent?.toLowerCase().includes('cancel'))
      cancelButton?.click()
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(mockRespond).toHaveBeenCalledWith({ approved: false })
    })

    it('should render loading state', () => {
      const renderFn = getHumanInTheLoopRenderFn()
      const result = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1', description: 'Test' }, status: 'inProgress' })
      const container = render(result as React.ReactElement).container
      expect(container.textContent).toContain('Preparing step confirmation')
      expect(container.querySelector('.border-yellow-400')).toBeInTheDocument()
    })

    describe('if (status === \'complete\') condition', () => {
      it('should render StepRejectionCard when status is complete and response.approved is false', async () => {
        const mockRespond = jest.fn().mockResolvedValue(undefined)
        let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
        ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
          renderFn = config.render
        })
        renderHook(() => useInfraTools(mockBlueprint))
        
        // First, trigger the cancel callback to set responseRef.current with approved: false
        const executingResult = renderFn?.({ 
          args: { stepNumber: 1, stepTitle: 'Step 1' }, 
          status: 'executing', 
          respond: mockRespond 
        })
        const executingContainer = render((executingResult || <></>) as React.ReactElement).container
        const cancelButton = Array.from(executingContainer.querySelectorAll('button')).find(
          (btn) => btn.textContent?.toLowerCase().includes('cancel')
        )
        cancelButton?.click()
        await new Promise((resolve) => setTimeout(resolve, 10))
        
        // Now test status === 'complete' - should render StepRejectionCard
        const completeResult = renderFn?.({ 
          args: { stepNumber: 1, stepTitle: 'Step 1' }, 
          status: 'complete' 
        })
        const completeContainer = render((completeResult || <></>) as React.ReactElement).container
        expect(completeContainer.textContent).toContain('Step 1')
        expect(completeContainer.textContent).toContain('rejected')
      })

      it('should return empty when status is complete but response is undefined', () => {
        let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
        ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
          renderFn = config.render
        })
        renderHook(() => useInfraTools(mockBlueprint))
        
        // Test status === 'complete' without setting responseRef - should return empty
        const result = renderFn?.({ 
          args: { stepNumber: 1, stepTitle: 'Step 1' }, 
          status: 'complete' 
        })
        expect(result).toEqual(<></>)
      })

      it('should show approval message when status is complete and response.approved is true', async () => {
        const mockRespond = jest.fn().mockResolvedValue(undefined)
        let renderFn: ((props: unknown) => React.ReactElement | null) | undefined
        ;(useHumanInTheLoop as jest.Mock).mockImplementation((config: { render?: (props: unknown) => React.ReactElement | null }) => {
          renderFn = config.render
        })
        renderHook(() => useInfraTools(mockBlueprint))
        
        // First, trigger the confirm callback to set responseRef.current with approved: true
        const executingResult = renderFn?.({ 
          args: { stepNumber: 2, stepTitle: 'Step 2' }, 
          status: 'executing', 
          respond: mockRespond 
        })
        const executingContainer = render((executingResult || <></>) as React.ReactElement).container
        const approveButton = Array.from(executingContainer.querySelectorAll('button')).find(
          (btn) => btn.textContent?.toLowerCase().includes('approve')
        )
        approveButton?.click()
        await new Promise((resolve) => setTimeout(resolve, 10))
        
        // Now test status === 'complete' with approved: true - should show approval message
        const completeResult = renderFn?.({ 
          args: { stepNumber: 2, stepTitle: 'Step 2' }, 
          status: 'complete' 
        })
        const { container } = render((completeResult || <></>) as React.ReactElement)
        expect(container.textContent).toContain('Step 2 approved')
        expect(container.textContent).toContain('Step 2')
      })

      it('should return empty when status is NOT complete', () => {
        const renderFn = getHumanInTheLoopRenderFn()
        
        // Test status !== 'complete' - should return empty (falls through to final return <></>)
        // Note: 'executing' without respond function also returns empty
        const result1 = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1' }, status: 'unknown' })
        const result2 = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1' }, status: 'pending' })
        const result3 = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1' }, status: 'executing' })
        
        expect(result1).toEqual(<></>)
        expect(result2).toEqual(<></>)
        // executing status without respond function returns empty
        expect(result3).toEqual(<></>)
      })
    })

    it('should return empty when status is unknown', () => {
      const renderFn = getHumanInTheLoopRenderFn()
      const result = renderFn?.({ args: { stepNumber: 1, stepTitle: 'Step 1' }, status: 'unknown' })
      expect(result).toEqual(<></>)
    })
  })

  describe('createFile render', () => {
    it('should return empty fragment', () => {
      const renderFn = getRenderFn('createFile')
      expect(renderFn?.(undefined)).toEqual(<></>)
    })
  })

  describe('writeToFile render (WriteToFileRenderer)', () => {
    const mockCreateFile = jest.fn()
    const mockStreamContent = jest.fn()
    const mockCompleteFile = jest.fn()
    const mockSelectFile = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      ;(useInfraStore as unknown as jest.Mock).mockReturnValue({
        createFile: mockCreateFile,
        streamContent: mockStreamContent,
        completeFile: mockCompleteFile,
        selectFile: mockSelectFile,
        files: [],
      })
    })

    it('should return empty when path/content missing and render FileProgressCard when valid', () => {
      const renderFn = getRenderFn('writeToFile')
      
      // Test empty cases
      const emptyCases = [
        { args: { path: '', content: 'test' }, status: 'writing' },
        { args: { path: 'test.tf', content: '' }, status: 'writing' },
      ]
      emptyCases.forEach((testCase) => {
        const result = renderFn?.(testCase)
        expect(render(result as React.ReactElement).container.firstChild).toBeNull()
      })
      
      // Test FileProgressCard rendering
      const validCases = [
        { args: { path: 'test.tf', content: 'content' }, status: 'writing' },
        { args: { path: 'test.tf', content: 'content' }, status: 'complete' },
      ]
      validCases.forEach((testCase) => {
        const result = renderFn?.(testCase)
        expect(render(result as React.ReactElement).container).toBeInTheDocument()
      })
    })

    it('should handle file creation useEffect', async () => {
      const renderFn = getRenderFn('writeToFile')
      render(renderFn?.({ args: { path: 'test.tf', content: '' }, status: 'writing' }) as React.ReactElement)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(mockCreateFile).toHaveBeenCalledWith('test.tf')
    })

    it('should handle content streaming useEffect', async () => {
      ;(useInfraStore as unknown as jest.Mock).mockReturnValue({
        createFile: mockCreateFile,
        streamContent: mockStreamContent,
        completeFile: mockCompleteFile,
        selectFile: mockSelectFile,
        files: [{ path: 'test.tf', content: '', status: 'creating' }],
      })
      const renderFn = getRenderFn('writeToFile')
      render(renderFn?.({ args: { path: 'test.tf', content: 'line 1' }, status: 'writing' }) as React.ReactElement)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(mockStreamContent).toHaveBeenCalledWith('test.tf', 'line 1')
    })

    it('should handle completion useEffect', async () => {
      ;(useInfraStore as unknown as jest.Mock).mockReturnValue({
        createFile: mockCreateFile,
        streamContent: mockStreamContent,
        completeFile: mockCompleteFile,
        selectFile: mockSelectFile,
        files: [{ path: 'test.tf', content: 'content', status: 'writing' }],
      })
      const renderFn = getRenderFn('writeToFile')
      render(renderFn?.({ args: { path: 'test.tf', content: 'content' }, status: 'complete' }) as React.ReactElement)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(mockCompleteFile).toHaveBeenCalledWith('test.tf')
    })

    it('should handle path change', async () => {
      const renderFn = getRenderFn('writeToFile')
      const { rerender } = render(renderFn?.({ args: { path: 'test1.tf', content: 'content1' }, status: 'writing' }) as React.ReactElement)
      rerender(renderFn?.({ args: { path: 'test2.tf', content: 'content2' }, status: 'writing' }) as React.ReactElement)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(mockCreateFile).toHaveBeenCalledWith('test2.tf')
    })

    it('should handle file exists case', async () => {
      ;(useInfraStore as unknown as jest.Mock).mockReturnValue({
        createFile: mockCreateFile,
        streamContent: mockStreamContent,
        completeFile: mockCompleteFile,
        selectFile: mockSelectFile,
        files: [{ path: 'test.tf', content: '', status: 'creating' }],
      })
      const renderFn = getRenderFn('writeToFile')
      render(renderFn?.({ args: { path: 'test.tf', content: '' }, status: 'writing' }) as React.ReactElement)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(mockCreateFile).not.toHaveBeenCalled()
      expect(mockSelectFile).toHaveBeenCalledWith('test.tf')
    })
  })

  describe('markStepComplete render', () => {
    it('should return empty when moduleName missing', () => {
      const renderFn = getRenderFn('markStepComplete')
      expect(renderFn?.({ args: {}, status: 'complete' })).toEqual(<></>)
    })

    it('should render StepCompletionCard when moduleName provided', () => {
      const renderFn = getRenderFn('markStepComplete')
      const result = renderFn?.({ args: { moduleName: 'VPC Module', stepNumber: 1 }, status: 'complete' })
      expect(render(result as React.ReactElement).container).toBeInTheDocument()
    })

    it('should handle handler', async () => {
      const handler = getHandler('markStepComplete')
      const result = (await handler?.({ moduleName: 'VPC Module', stepNumber: 1 })) as string
      expect(result).toContain('created successfully')
    })
  })
})

