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
  it('should render all resources with names, lines read, and status indicators', () => {
    render(<ResourceDocsCard resources={mockResources} />)
    
    // Check all resource names
    expect(screen.getByText('aws/db_instance')).toBeInTheDocument()
    expect(screen.getByText('random/password')).toBeInTheDocument()
    expect(screen.getByText('aws/s3_bucket')).toBeInTheDocument()
    
    // Check lines read for found resources
    expect(screen.getByText('150 lines read')).toBeInTheDocument()
    expect(screen.getByText('50 lines read')).toBeInTheDocument()
    
    // Check not-found status
    expect(screen.getByText('Docs not found')).toBeInTheDocument()
  })

  it('should return null when resources is empty or undefined', () => {
    const emptyCases = [
      { resources: [] },
      { resources: undefined as ResourceDoc[] | undefined },
    ]

    emptyCases.forEach(({ resources }) => {
      const { container, unmount } = render(<ResourceDocsCard resources={resources} />)
      expect(container.firstChild).toBeNull()
      unmount()
    })
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

