import { getTemplateForStep, agentInstructions } from '../agent-instructions'
import { BlueprintStep } from '../blueprints'

describe('agent-instructions', () => {
  describe('agentInstructions', () => {
    it('should be a non-empty string', () => {
      expect(agentInstructions).toBeDefined()
      expect(typeof agentInstructions).toBe('string')
      expect(agentInstructions.length).toBeGreaterThan(0)
    })

    it('should contain key workflow instructions', () => {
      expect(agentInstructions).toContain('displayStepsList')
      expect(agentInstructions).toContain('requestStepConfirmation')
      expect(agentInstructions).toContain('writeToFile')
      expect(agentInstructions).toContain('markStepComplete')
    })
  })

  describe('getTemplateForStep', () => {
    it('should return VPC templates for VPC step', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'VPC Module',
        type: 'terraform-module',
        description: 'VPC',
        moduleName: 'vpc',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
      expect(templates.main).toContain('aws_vpc')
    })

    it('should return S3 templates for S3 step', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'S3 Static Website',
        type: 'terraform-module',
        description: 'S3',
        moduleName: 's3-website',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })

    it('should return RDS templates for RDS step', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'RDS PostgreSQL Database',
        type: 'terraform-module',
        description: 'RDS',
        moduleName: 'rds-postgres',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })

    it('should return Lambda templates for Lambda step', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'Lambda API Module',
        type: 'terraform-module',
        description: 'Lambda',
        moduleName: 'lambda-api',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })

    it('should return GitHub Actions workflow for github-actions type', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'CI/CD Pipeline',
        type: 'github-actions',
        description: 'GitHub Actions',
        workflowName: '.github/workflows/deploy.yml',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeUndefined()
      expect(templates.outputs).toBeUndefined()
    })

    it('should return default VPC templates for unknown step', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'Unknown Module',
        type: 'terraform-module',
        description: 'Unknown',
        moduleName: 'unknown',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })

    it('should match by moduleName', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'Some Title',
        type: 'terraform-module',
        description: 'Description',
        moduleName: 'vpc-module',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.main).toContain('aws_vpc')
    })

    it('should match by stepTitle', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'VPC Network',
        type: 'terraform-module',
        description: 'Description',
        moduleName: 'network',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.main).toContain('aws_vpc')
    })

    it('should handle case-insensitive matching', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'VPC Module',
        type: 'terraform-module',
        description: 'Description',
        moduleName: 'VPC',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
    })

    it('should handle CloudFront in module name', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'CloudFront Distribution',
        type: 'terraform-module',
        description: 'CloudFront',
        moduleName: 'cloudfront-module',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })

    it('should handle static in step title', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'Static Website',
        type: 'terraform-module',
        description: 'Static',
        moduleName: 'website',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
    })

    it('should handle postgres in module name', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'PostgreSQL Database',
        type: 'terraform-module',
        description: 'Database',
        moduleName: 'postgres-db',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
      expect(templates.main).toContain('aws_db_instance')
    })

    it('should handle database in step title', () => {
      const step: BlueprintStep = {
        id: 1,
        title: 'Database Module',
        type: 'terraform-module',
        description: 'Database',
        moduleName: 'db',
      }

      const templates = getTemplateForStep(step)

      expect(templates.main).toBeDefined()
    })

    it('should handle empty moduleName and stepTitle', () => {
      const step: BlueprintStep = {
        id: 1,
        title: '',
        type: 'terraform-module',
        description: '',
        moduleName: '',
      }

      const templates = getTemplateForStep(step)

      // Should return default VPC template
      expect(templates.main).toBeDefined()
      expect(templates.variables).toBeDefined()
      expect(templates.outputs).toBeDefined()
    })
  })
})

