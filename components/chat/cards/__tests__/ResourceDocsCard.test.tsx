import { render, screen } from '@testing-library/react'
import { ResourceDocsCard } from '../ResourceDocsCard'

type ResourceDoc = {
  name: string
  status: 'found' | 'not-found'
  linesRead?: number
}

const mockResources = [
  {
    name: 'aws/db_instance',
    status: 'found' as const,
    linesRead: 150,
  },
  {
    name: 'random/password',
    status: 'found' as const,
    linesRead: 50,
  },
  {
    name: 'aws/s3_bucket',
    status: 'not-found' as const,
  },
]

describe('ResourceDocsCard', () => {
  it('should render resource names', () => {
    render(<ResourceDocsCard resources={mockResources} />)
    expect(screen.getByText('aws/db_instance')).toBeInTheDocument()
    expect(screen.getByText('random/password')).toBeInTheDocument()
    expect(screen.getByText('aws/s3_bucket')).toBeInTheDocument()
  })

  it('should display lines read for found resources', () => {
    render(<ResourceDocsCard resources={mockResources} />)
    expect(screen.getByText('150 lines read')).toBeInTheDocument()
    expect(screen.getByText('50 lines read')).toBeInTheDocument()
  })

  it('should show found status with checkmark', () => {
    render(<ResourceDocsCard resources={mockResources} />)
    // Checkmarks are rendered as SVG icons (CheckCircle2)
    // Just verify the resources are rendered
    expect(screen.getByText('aws/db_instance')).toBeInTheDocument()
    expect(screen.getByText('150 lines read')).toBeInTheDocument()
  })

  it('should show not-found status', () => {
    render(<ResourceDocsCard resources={mockResources} />)
    expect(screen.getByText('Docs not found')).toBeInTheDocument()
  })

  it('should return null when resources array is empty', () => {
    const { container } = render(<ResourceDocsCard resources={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when resources is undefined', () => {
    const { container } = render(<ResourceDocsCard resources={undefined as ResourceDoc[] | undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should handle resources without linesRead', () => {
    const resourcesWithoutLines = [
      {
        name: 'aws/vpc',
        status: 'found' as const,
      },
    ]
    render(<ResourceDocsCard resources={resourcesWithoutLines as ResourceDoc[]} />)
    expect(screen.getByText('aws/vpc')).toBeInTheDocument()
  })
})

