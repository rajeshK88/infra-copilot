'use client'

import { BlueprintCard } from './blueprint-card'
import { Blueprint } from '@/lib/blueprints'

interface BlueprintListProps {
  blueprints: Blueprint[]
}

export const BlueprintList = ({ blueprints }: BlueprintListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {blueprints.map((blueprint, index) => (
        <BlueprintCard key={blueprint.id} blueprint={blueprint} index={index} />
      ))}
    </div>
  )
}
