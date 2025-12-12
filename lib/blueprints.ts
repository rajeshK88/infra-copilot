export interface Blueprint {
  id: string
  slug: string
  name: string
  description: string
  cost: string
  setupTime: string
  technologies: string[]
  category: string
  cloudProvider: string
  whatYouBuild: string
  steps: BlueprintStep[]
}

export interface BlueprintStep {
  id: number
  title: string
  type: 'terraform-environment' | 'terraform-module' | 'github-actions'
  description: string
  moduleName?: string
  moduleSource?: string
  workflowName?: string
  workflowSteps?: number
}

export const blueprints: Blueprint[] = [
  {
    id: '1',
    slug: 'gcp-cloud-run-containerized-app',
    name: 'GCP Cloud Run Containerized App',
    description: 'Deploy containerized applications on GCP Cloud Run with Artifact Registry',
    cost: '$10-30/month',
    setupTime: '2-3 minutes',
    technologies: ['Cloud Run', 'Artifact Registry', 'GitHub Actions', 'Docker', 'Terraform'],
    category: 'Web & API',
    cloudProvider: 'Google Cloud',
    whatYouBuild:
      'This blueprint creates a complete containerized application deployment on GCP using Cloud Run for serverless containers and Artifact Registry for container image storage. Includes proper IAM configuration, automatic scaling, and CI/CD pipeline with GitHub Actions for seamless deployments.',
    steps: [
      {
        id: 1,
        title: 'Artifact Registry',
        type: 'terraform-environment',
        description: 'Terraform Environment',
        moduleName: 'Artifact Registry',
      },
      {
        id: 2,
        title: 'Cloud Run Service Module',
        type: 'terraform-module',
        description: 'Terraform Module',
        moduleName: 'Cloud Run Service Module',
      },
      {
        id: 3,
        title: 'Cloud Run Application',
        type: 'terraform-environment',
        description: 'Terraform Environment',
        moduleName: 'Cloud Run Application',
      },
      {
        id: 4,
        title: 'Cloud Run CI/CD Pipeline',
        type: 'github-actions',
        description: 'GitHub Actions',
        workflowName: '.github/workflows/deploy-cloud-run.yml',
        workflowSteps: 5,
      },
    ],
  },
  {
    id: '2',
    slug: 'aws-s3-static-website-cloudfront',
    name: 'AWS S3 Static Website with CloudFront',
    description: 'Deploy a static website on AWS S3 with CloudFront CDN and custom domain',
    cost: '$1-10/month',
    setupTime: '2-3 minutes',
    technologies: ['S3', 'CloudFront', 'Route 53', 'GitHub Actions', 'Terraform'],
    category: 'Web & API',
    cloudProvider: 'AWS',
    whatYouBuild:
      'This blueprint creates a complete static website hosting solution on AWS using S3 for storage, CloudFront for global content delivery, and Route 53 for DNS management. Perfect for static sites, SPAs, and documentation sites with automatic HTTPS and global CDN distribution.',
    steps: [
      {
        id: 1,
        title: 'S3 CloudFront Website Module',
        type: 'terraform-module',
        description: 'Terraform Module',
        moduleName: 'S3 CloudFront Website Module',
      },
      {
        id: 2,
        title: 'Static Website',
        type: 'terraform-environment',
        description: 'Terraform Environment',
        moduleName: 'Static Website',
      },
      {
        id: 3,
        title: 'Static Site CI/CD Pipeline',
        type: 'github-actions',
        description: 'GitHub Actions',
        workflowName: '.github/workflows/deploy-static-site.yml',
        workflowSteps: 4,
      },
    ],
  },
  {
    id: '3',
    slug: 'aws-lambda-serverless-api',
    name: 'AWS Lambda Serverless API',
    description: 'Build a scalable REST API using AWS Lambda, API Gateway, and DynamoDB',
    cost: '$5-25/month',
    setupTime: '3-4 minutes',
    technologies: ['Lambda', 'API Gateway', 'DynamoDB', 'GitHub Actions', 'Terraform'],
    category: 'Web & API',
    cloudProvider: 'AWS',
    whatYouBuild:
      'This blueprint creates a complete serverless API infrastructure on AWS using Lambda functions for compute, API Gateway for HTTP routing, and DynamoDB for data storage. Includes proper IAM roles, CORS configuration, and automated deployments with GitHub Actions.',
    steps: [
      {
        id: 1,
        title: 'DynamoDB Table Module',
        type: 'terraform-module',
        description: 'Terraform Module',
        moduleName: 'DynamoDB Table Module',
      },
      {
        id: 2,
        title: 'Lambda API Module',
        type: 'terraform-module',
        description: 'Terraform Module',
        moduleName: 'Lambda API Module',
      },
      {
        id: 3,
        title: 'API Gateway Module',
        type: 'terraform-module',
        description: 'Terraform Module',
        moduleName: 'API Gateway Module',
      },
      {
        id: 4,
        title: 'Serverless API',
        type: 'terraform-environment',
        description: 'Terraform Environment',
        moduleName: 'Serverless API',
      },
    ],
  },
]

export const getBlueprintBySlug = (slug: string): Blueprint | undefined => {
  return blueprints.find((bp) => {
    return bp.slug === slug
  })
}

export const getBlueprintById = (id: string): Blueprint | undefined => {
  return blueprints.find((bp) => {
    return bp.id === id
  })
}

export const getAllBlueprints = (): Blueprint[] => {
  return blueprints
}
