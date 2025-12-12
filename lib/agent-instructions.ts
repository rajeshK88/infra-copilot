import { BlueprintStep } from './blueprints'
import { getTemplate } from './terraform-templates'

/**
 * Agent instructions for executing blueprint steps
 * This provides the AI agent with guidance on how to execute each step
 */

export const agentInstructions = `
AI infrastructure agent. Build step by step. Continue through ALL steps without stopping.

## RULES

1. Call displayStepsList, then requestStepConfirmation for Step 1
2. Write files ONE AT A TIME. Wait for completion
3. After ALL THREE files written, call markStepComplete
4. After markStepComplete, IMMEDIATELY call requestStepConfirmation for next step
5. CRITICAL: Continue through ALL steps. Do NOT stop after step 2 or 3

## TOOLS

1. displayStepsList - Show steps
2. retrieveTemplates - Get templates (ONCE per step, returns main/variables/outputs)
3. requestStepConfirmation - Ask permission
4. writeToFile - Write ONE file, wait
5. markStepComplete - Show completion

## WORKFLOW

When Chat Starts:
1. Call displayStepsList
2. IMMEDIATELY call requestStepConfirmation for Step 1

For Each Step:
1. Call requestStepConfirmation
2. If approved:
   - Call retrieveTemplates ONCE
   - Write ALL THREE files (main.tf, variables.tf, outputs.tf):
     * writeToFile({ path: "infra/modules/[name]/main.tf", content: templates.main }) → WAIT
     * writeToFile({ path: "infra/modules/[name]/variables.tf", content: templates.variables }) → WAIT
     * writeToFile({ path: "infra/modules/[name]/outputs.tf", content: templates.outputs }) → WAIT
   - Call markStepComplete({ moduleName: "[name]", stepNumber: [n] })
3. IMMEDIATELY call requestStepConfirmation for next step

## TOOL USAGE

Paths: Extract module name from step title, lowercase, hyphens.
- terraform-module: infra/modules/[name]/main.tf, variables.tf, outputs.tf
- terraform-environment: infra/environments/[name]/main.tf, variables.tf, outputs.tf

For Terraform: Write ALL THREE files (main.tf, variables.tf, outputs.tf). Templates ALWAYS exist.
`

/**
 * Get template code for a specific step
 */
export const getTemplateForStep = (
  step: BlueprintStep
): {
  main?: string
  variables?: string
  outputs?: string
} => {
  const moduleName = step.moduleName?.toLowerCase() || ''
  const stepTitle = step.title?.toLowerCase() || ''

  // S3 / CloudFront / Static Website
  if (
    moduleName.includes('s3') ||
    moduleName.includes('cloudfront') ||
    moduleName.includes('static') ||
    stepTitle.includes('s3') ||
    stepTitle.includes('cloudfront') ||
    stepTitle.includes('static')
  ) {
    return {
      main: getTemplate('s3Main'),
      variables: getTemplate('s3Variables'),
      outputs: getTemplate('s3Outputs'),
    }
  }

  // VPC
  if (moduleName.includes('vpc') || stepTitle.includes('vpc')) {
    return {
      main: getTemplate('vpcMain'),
      variables: getTemplate('vpcVariables'),
      outputs: getTemplate('vpcOutputs'),
    }
  }

  // RDS / Database
  if (
    moduleName.includes('rds') ||
    moduleName.includes('postgres') ||
    moduleName.includes('database') ||
    stepTitle.includes('rds') ||
    stepTitle.includes('database')
  ) {
    return {
      main: getTemplate('rdsMain'),
      variables: getTemplate('rdsVariables'),
      outputs: getTemplate('rdsOutputs'),
    }
  }

  // Lambda / API
  if (
    moduleName.includes('lambda') ||
    moduleName.includes('api') ||
    stepTitle.includes('lambda') ||
    stepTitle.includes('api')
  ) {
    return {
      main: getTemplate('lambdaMain'),
      variables: getTemplate('lambdaVariables'),
      outputs: getTemplate('lambdaOutputs'),
    }
  }

  // GitHub Actions workflows
  if (step.type === 'github-actions') {
    return {
      main: getTemplate('githubActionsWorkflow'),
      variables: undefined,
      outputs: undefined,
    }
  }

  // Default: return VPC template
  return {
    main: getTemplate('vpcMain'),
    variables: getTemplate('vpcVariables'),
    outputs: getTemplate('vpcOutputs'),
  }
}

