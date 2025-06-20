import { describe, it, expect } from 'vitest'
import { ARTWORKS_CONFIG } from '../../../config/artworks'

// 测试艺术品配置 / Test Artwork Configuration
describe('Artworks Configuration', () => {
  // 测试中央艺术品配置 / Test central artwork configuration
  it('should have a valid central artwork configuration', () => {
    const central = ARTWORKS_CONFIG.central
    
    // 检查必填字段 / Check required fields
    expect(central).toHaveProperty('position')
    expect(central).toHaveProperty('size')
    expect(central).toHaveProperty('rotation')
    expect(central).toHaveProperty('imageUrl')
    expect(central).toHaveProperty('title')
    expect(central).toHaveProperty('description')
    
    // 检查数据类型 / Check data types
    expect(Array.isArray(central.position)).toBe(true)
    expect(Array.isArray(central.size)).toBe(true)
    expect(Array.isArray(central.rotation)).toBe(true)
    expect(typeof central.imageUrl).toBe('string')
    expect(typeof central.title).toBe('string')
    expect(typeof central.description).toBe('string')
  })

  // 测试左墙艺术品配置 / Test left wall artwork configurations
  it('should have valid left wall artwork configurations', () => {
    const left = ARTWORKS_CONFIG.left
    
    expect(Array.isArray(left)).toBe(true)
    expect(left.length).toBeGreaterThan(0)
    
    left.forEach(artwork => {
      expect(artwork).toHaveProperty('position')
      expect(artwork).toHaveProperty('imageUrl')
      expect(artwork).toHaveProperty('title')
      expect(artwork).toHaveProperty('description')
    })
  })

  // 测试右墙艺术品配置 / Test right wall artwork configurations
  it('should have valid right wall artwork configurations', () => {
    const right = ARTWORKS_CONFIG.right
    
    expect(Array.isArray(right)).toBe(true)
    expect(right.length).toBeGreaterThan(0)
    
    right.forEach(artwork => {
      expect(artwork).toHaveProperty('position')
      expect(artwork).toHaveProperty('imageUrl')
      expect(artwork).toHaveProperty('title')
      expect(artwork).toHaveProperty('description')
    })
  })
}) 