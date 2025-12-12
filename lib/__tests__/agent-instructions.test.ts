import { getTemplateForStep, agentInstructions } from '../agent-instructions'
import { BlueprintStep } from '../blueprints'

describe('agent-instructions', () => {
  describe('agentInstructions', () => {
    it('should be a non-empty string containing key workflow instructions', () => {
      expect(agentInstructions).toBeDefined()
      expect(typeof agentInstructions).toBe('string')
      expect(agentInstructions.length).toBeGreaterThan(0)
      expect(agentInstructions).toContain('displayStepsList')
      expect(agentInstructions).toContain('requestStepConfirmation')
      expect(agentInstructions).toContain('writeToFile')
      expect(agentInstructions).toContain('markStepComplete')
    })
  })

  describe('getTemplateForStep', () => {
    it('should return correct templates for different step types and modules', () => {
      const testCases = [
        {
          name: 'VPC step',
          step: {
            id: 1,
            title: 'VPC Module',
            type: 'terraform-module' as const,
            description: 'VPC',
            moduleName: 'vpc',
          },
          expected: { hasMain: true, hasVariables: true, hasOutputs: true, contains: 'aws_vpc' },
        },
        {
          name: 'S3 step',
          step: {
            id: 1,
            title: 'S3 Static Website',
            type: 'terraform-module' as const,
            description: 'S3',
            moduleName: 's3-website',
          },
          expected: { hasMain: true, hasVariables: true, hasOutputs: true },
        },
        {
          name: 'RDS step',
          step: {
            id: 1,
            title: 'RDS PostgreSQL Database',
            type: 'terraform-module' as const,
            description: 'RDS',
            moduleName: 'rds-postgres',
          },
          expected: { hasMain: true, hasVariables: true, hasOutputs: true },
        },
        {
          name: 'Lambda step',
          step: {
            id: 1,
            title: 'Lambda API Module',
            type: 'terraform-module' as const,
            description: 'Lambda',
            moduleName: 'lambda-api',
          },
          expected: { hasMain: true, hasVariables: true, hasOutputs: true },
        },
        {
          name: 'GitHub Actions type',
          step: {
            id: 1,
            title: 'CI/CD Pipeline',
            type: 'github-actions' as const,
            description: 'GitHub Actions',
            workflowName: '.github/workflows/deploy.yml',
          },
          expected: { hasMain: true, hasVariables: false, hasOutputs: false },
        },
        {
          name: 'unknown step (defaults to VPC)',
          step: {
            id: 1,
            title: 'Unknown Module',
            type: 'terraform-module' as const,
            description: 'Unknown',
            moduleName: 'unknown',
          },
          expected: { hasMain: true, hasVariables: true, hasOutputs: true },
        },
      ]

      testCases.forEach(({ name: _name, step, expected }) => {
        const templates = getTemplateForStep(step as BlueprintStep)
        expect(templates.main).toBeDefined()
        if (expected.hasVariables) {
          expect(templates.variables).toBeDefined()
        } else {
          expect(templates.variables).toBeUndefined()
        }
        if (expected.hasOutputs) {
          expect(templates.outputs).toBeDefined()
        } else {
          expect(templates.outputs).toBeUndefined()
        }
        if (expected.contains) {
          expect(templates.main).toContain(expected.contains)
        }
      })
    })

    it('should match by moduleName, stepTitle, handle case-insensitive matching, and edge cases', () => {
      const testCases = [
        {
          name: 'match by moduleName',
          step: {
            id: 1,
            title: 'Some Title',
            type: 'terraform-module' as const,
            description: 'Description',
            moduleName: 'vpc-module',
          },
          expected: { contains: 'aws_vpc' },
        },
        {
          name: 'match by stepTitle',
          step: {
            id: 1,
            title: 'VPC Network',
            type: 'terraform-module' as const,
            description: 'Description',
            moduleName: 'network',
          },
          expected: { contains: 'aws_vpc' },
        },
        {
          name: 'case-insensitive matching',
          step: {
            id: 1,
            title: 'VPC Module',
            type: 'terraform-module' as const,
            description: 'Description',
            moduleName: 'VPC',
          },
          expected: {},
        },
        {
          name: 'CloudFront in module name',
          step: {
            id: 1,
            title: 'CloudFront Distribution',
            type: 'terraform-module' as const,
            description: 'CloudFront',
            moduleName: 'cloudfront-module',
          },
          expected: { hasVariables: true, hasOutputs: true },
        },
        {
          name: 'static in step title',
          step: {
            id: 1,
            title: 'Static Website',
            type: 'terraform-module' as const,
            description: 'Static',
            moduleName: 'website',
          },
          expected: {},
        },
        {
          name: 'postgres in module name',
          step: {
            id: 1,
            title: 'PostgreSQL Database',
            type: 'terraform-module' as const,
            description: 'Database',
            moduleName: 'postgres-db',
          },
          expected: { contains: 'aws_db_instance' },
        },
        {
          name: 'database in step title',
          step: {
            id: 1,
            title: 'Database Module',
            type: 'terraform-module' as const,
            description: 'Database',
            moduleName: 'db',
          },
          expected: {},
        },
        {
          name: 'empty moduleName and stepTitle (defaults to VPC)',
          step: {
            id: 1,
            title: '',
            type: 'terraform-module' as const,
            description: '',
            moduleName: '',
          },
          expected: { hasVariables: true, hasOutputs: true },
        },
      ]

      testCases.forEach(({ name: _name, step, expected }) => {
        const templates = getTemplateForStep(step as BlueprintStep)
        expect(templates.main).toBeDefined()
        if (expected.hasVariables !== undefined) {
          if (expected.hasVariables) {
            expect(templates.variables).toBeDefined()
            expect(templates.outputs).toBeDefined()
          }
        }
        if (expected.contains) {
          expect(templates.main).toContain(expected.contains)
        }
      })
    })
  })
})

