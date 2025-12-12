import { getBlueprintBySlug, getBlueprintById, getAllBlueprints, blueprints } from '../blueprints'

describe('blueprints', () => {
  describe('getAllBlueprints', () => {
    it('should return all blueprints', () => {
      const all = getAllBlueprints()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBeGreaterThan(0)
    })

    it('should return the same array as blueprints export', () => {
      const all = getAllBlueprints()
      expect(all).toEqual(blueprints)
    })
  })

  describe('getBlueprintBySlug', () => {
    it('should return blueprint for valid slug', () => {
      const blueprint = getBlueprintBySlug('gcp-cloud-run-containerized-app')
      expect(blueprint).toBeDefined()
      expect(blueprint?.slug).toBe('gcp-cloud-run-containerized-app')
      expect(blueprint?.name).toBe('GCP Cloud Run Containerized App')
    })

    it('should return undefined for invalid slug', () => {
      const blueprint = getBlueprintBySlug('non-existent-slug')
      expect(blueprint).toBeUndefined()
    })

    it('should return blueprint with correct structure', () => {
      const blueprint = getBlueprintBySlug('aws-s3-static-website-cloudfront')
      expect(blueprint).toBeDefined()
      expect(blueprint?.id).toBeDefined()
      expect(blueprint?.name).toBeDefined()
      expect(blueprint?.description).toBeDefined()
      expect(blueprint?.steps).toBeDefined()
      expect(Array.isArray(blueprint?.steps)).toBe(true)
    })
  })

  describe('getBlueprintById', () => {
    it('should return blueprint for valid id', () => {
      const blueprint = getBlueprintById('1')
      expect(blueprint).toBeDefined()
      expect(blueprint?.id).toBe('1')
    })

    it('should return undefined for invalid id', () => {
      const blueprint = getBlueprintById('999')
      expect(blueprint).toBeUndefined()
    })
  })

  describe('blueprint structure', () => {
    it('should have all required fields', () => {
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
      })
    })

    it('should have valid step structure', () => {
      blueprints.forEach((blueprint) => {
        blueprint.steps.forEach((step) => {
          expect(step.id).toBeDefined()
          expect(step.title).toBeDefined()
          expect(step.type).toBeDefined()
          expect(['terraform-environment', 'terraform-module', 'github-actions']).toContain(step.type)
          expect(step.description).toBeDefined()
        })
      })
    })

    it('should have unique slugs', () => {
      const slugs = blueprints.map((bp) => bp.slug)
      const uniqueSlugs = new Set(slugs)
      expect(slugs.length).toBe(uniqueSlugs.size)
    })

    it('should have unique ids', () => {
      const ids = blueprints.map((bp) => bp.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })
  })
})

