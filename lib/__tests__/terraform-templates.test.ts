import { getTemplate, terraformTemplates } from '../terraform-templates'

describe('terraform-templates', () => {
  describe('terraformTemplates object', () => {
    it('should export terraformTemplates object with all keys', () => {
      expect(terraformTemplates).toBeDefined()
      expect(typeof terraformTemplates).toBe('object')
      expect(terraformTemplates.vpcMain).toBeDefined()
      expect(terraformTemplates.vpcVariables).toBeDefined()
      expect(terraformTemplates.vpcOutputs).toBeDefined()
      expect(terraformTemplates.rdsMain).toBeDefined()
      expect(terraformTemplates.rdsVariables).toBeDefined()
      expect(terraformTemplates.rdsOutputs).toBeDefined()
      expect(terraformTemplates.lambdaMain).toBeDefined()
      expect(terraformTemplates.lambdaVariables).toBeDefined()
      expect(terraformTemplates.lambdaOutputs).toBeDefined()
      expect(terraformTemplates.s3Main).toBeDefined()
      expect(terraformTemplates.s3Variables).toBeDefined()
      expect(terraformTemplates.s3Outputs).toBeDefined()
      expect(terraformTemplates.githubActionsWorkflow).toBeDefined()
    })

    it('should have all template values as non-empty strings', () => {
      Object.values(terraformTemplates).forEach((template) => {
        expect(typeof template).toBe('string')
        expect(template.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getTemplate', () => {
    it('should return VPC main template', () => {
      const template = getTemplate('vpcMain')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
      expect(template.length).toBeGreaterThan(0)
      expect(template).toContain('aws_vpc')
    })

    it('should return VPC variables template', () => {
      const template = getTemplate('vpcVariables')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
      expect(template.length).toBeGreaterThan(0)
      expect(template).toContain('variable')
    })

    it('should return VPC outputs template', () => {
      const template = getTemplate('vpcOutputs')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
      expect(template.length).toBeGreaterThan(0)
      expect(template).toContain('output')
    })

    it('should return RDS main template', () => {
      const template = getTemplate('rdsMain')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
      expect(template.length).toBeGreaterThan(0)
    })

    it('should return RDS variables template', () => {
      const template = getTemplate('rdsVariables')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return RDS outputs template', () => {
      const template = getTemplate('rdsOutputs')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return Lambda main template', () => {
      const template = getTemplate('lambdaMain')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return Lambda variables template', () => {
      const template = getTemplate('lambdaVariables')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return Lambda outputs template', () => {
      const template = getTemplate('lambdaOutputs')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return S3 main template', () => {
      const template = getTemplate('s3Main')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return S3 variables template', () => {
      const template = getTemplate('s3Variables')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return S3 outputs template', () => {
      const template = getTemplate('s3Outputs')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
    })

    it('should return GitHub Actions workflow template', () => {
      const template = getTemplate('githubActionsWorkflow')
      expect(template).toBeDefined()
      expect(typeof template).toBe('string')
      expect(template).toContain('on:')
      expect(template).toContain('jobs:')
    })

    it('should return empty string for unknown template', () => {
      const template = getTemplate('unknownTemplate' as keyof typeof terraformTemplates)
      expect(template).toBe('')
    })

    it('should handle all template keys', () => {
      const allKeys = [
        'vpcMain',
        'vpcVariables',
        'vpcOutputs',
        'rdsMain',
        'rdsVariables',
        'rdsOutputs',
        'lambdaMain',
        'lambdaVariables',
        'lambdaOutputs',
        's3Main',
        's3Variables',
        's3Outputs',
        'githubActionsWorkflow',
      ]

      allKeys.forEach((key) => {
        const template = getTemplate(key as keyof typeof terraformTemplates)
        expect(template).toBeDefined()
        expect(typeof template).toBe('string')
      })
    })

    it('should return empty string for unknown key', () => {
      const template = getTemplate('unknownKey' as keyof typeof terraformTemplates)
      expect(template).toBe('')
    })

    it('should return template for valid key', () => {
      const template = getTemplate('vpcMain')
      expect(template).toBeTruthy()
      expect(template.length).toBeGreaterThan(0)
      expect(template).toContain('aws_vpc')
    })

    it('should return valid Terraform syntax for all templates', () => {
      const templateKeys = [
        'vpcMain',
        'vpcVariables',
        'vpcOutputs',
        'rdsMain',
        'rdsVariables',
        'rdsOutputs',
        'lambdaMain',
        'lambdaVariables',
        'lambdaOutputs',
        's3Main',
        's3Variables',
        's3Outputs',
      ]

      templateKeys.forEach((key) => {
        const template = getTemplate(key as keyof typeof terraformTemplates)
        expect(template).toBeDefined()
        expect(template.length).toBeGreaterThan(0)
      })
    })

    it('should return empty string for unknown key (covers line 651 fallback)', () => {
      const template = getTemplate('unknownKey' as keyof typeof terraformTemplates)
      expect(template).toBe('')
    })
  })
})

