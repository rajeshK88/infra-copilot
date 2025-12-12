import { MainLayout } from '@/components/layout/main-layout'
import { getBlueprintById } from '@/lib/blueprints'
import { CopilotKit } from '@copilotkit/react-core'
import { notFound } from 'next/navigation'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const { id } = await params
  const blueprint = getBlueprintById(id)

  if (!blueprint) {
    notFound()
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false}>
      <MainLayout blueprint={blueprint} />
    </CopilotKit>
  )
}

export default ChatPage
