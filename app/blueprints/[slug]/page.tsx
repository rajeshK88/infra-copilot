import { BlueprintDetail } from '@/components/blueprint-detail'
import { getBlueprintBySlug } from '@/lib/blueprints'
import { notFound } from 'next/navigation'

interface BlueprintPageProps {
  params: Promise<{ slug: string }>
}

const BlueprintPage = async ({ params }: BlueprintPageProps) => {
  const { slug } = await params
  const blueprint = getBlueprintBySlug(slug)

  if (!blueprint) {
    notFound()
  }

  return <BlueprintDetail blueprint={blueprint} />
}

export default BlueprintPage
