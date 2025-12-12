import { getBlueprintBySlug, getBlueprintById, getAllBlueprints, blueprints } from '../blueprints'

describe('blueprints', () => {
  describe('getAllBlueprints', () => {
    it('should return all blueprints matching the blueprints export', () => {
      const all = getAllBlueprints()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBeGreaterThan(0)
      expect(all).toEqual(blueprints)
    })
  })

  describe('getBlueprintBySlug', () => {
    it('should return blueprint for valid slug with correct structure, or undefined for invalid slug', () => {
      // Test valid slug
      const blueprint = getBlueprintBySlug('gcp-cloud-run-containerized-app')
      expect(blueprint).toBeDefined()
      expect(blueprint?.slug).toBe('gcp-cloud-run-containerized-app')
      expect(blueprint?.name).toBe('GCP Cloud Run Containerized App')
      expect(blueprint?.id).toBeDefined()
      expect(blueprint?.description).toBeDefined()
      expect(blueprint?.steps).toBeDefined()
      expect(Array.isArray(blueprint?.steps)).toBe(true)
      
      // Test invalid slug
      const invalidBlueprint = getBlueprintBySlug('non-existent-slug')
      expect(invalidBlueprint).toBeUndefined()
    })
  })

  describe('getBlueprintById', () => {
    it('should return blueprint for valid id or undefined for invalid id', () => {
      // Test valid id
      const blueprint = getBlueprintById('1')
      expect(blueprint).toBeDefined()
      expect(blueprint?.id).toBe('1')
      
      // Test invalid id
      const invalidBlueprint = getBlueprintById('999')
      expect(invalidBlueprint).toBeUndefined()
    })
  })

  describe('blueprint structure', () => {
    it('should have all required fields, valid step structure, and unique slugs/ids', () => {
      // Test all required fields
      blueprints.forEach((blueprint) => {
        expect(blueprint.id).toBeDefined()
        expect(blueprint.slug).toBeDefined()
        expect(blueprint.name).toBeDefined()
        expect(blueprint.description).toBeDefined()
        expect(blueprint.cost).toBeDefined()
        expect(blueprint.setupTime).toBeDefined()
        expect(blueprint.technologies).toBeDefined()
        expect(Array.isArray(blueprint.technologies)).toBe(true)
        expect(blueprint.category).toBeDefined()
        expect(blueprint.cloudProvider).toBeDefined()
        expect(blueprint.whatYouBuild).toBeDefined()
        expect(blueprint.steps).toBeDefined()
        expect(Array.isArray(blueprint.steps)).toBe(true)
        
        // Test step structure
        blueprint.steps.forEach((step) => {
          expect(step.id).toBeDefined()
          expect(step.title).toBeDefined()
          expect(step.type).toBeDefined()
          expect(['terraform-environment', 'terraform-module', 'github-actions']).toContain(step.type)
          expect(step.description).toBeDefined()
        })
      })
      
      // Test unique slugs
      const slugs = blueprints.map((bp) => bp.slug)
      const uniqueSlugs = new Set(slugs)
      expect(slugs.length).toBe(uniqueSlugs.size)
      
      // Test unique ids
      const ids = blueprints.map((bp) => bp.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })
  })
})

