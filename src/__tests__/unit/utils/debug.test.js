/* globals process */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { debug } from '../../../utils/debug'

// 调试工具测试 / Debug Utility Tests
describe('Debug Utility', () => {
  beforeEach(() => {
    // 重置所有模拟 / Reset all mocks
    vi.clearAllMocks()
    
    // 模拟全局 process 对象 / Mock global process object
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'development'
      }
    })
    
    // 监视 console 方法 / Spy on console methods
    vi.spyOn(console, 'log')
    vi.spyOn(console, 'error')
    vi.spyOn(console, 'warn')
  })

  afterEach(() => {
    // 清理全局模拟 / Clean up global mocks
    vi.unstubAllGlobals()
  })

  // 应在开发环境中输出日志 / Should output logs in development environment
  it('should output logs in development environment', () => {
    process.env.NODE_ENV = 'development'
    debug.log('test log')
    expect(console.log).toHaveBeenCalledWith('test log')
  })

  // 不应在生产环境中输出日志 / Should not output logs in production environment
  it('should not output logs in production environment', () => {
    process.env.NODE_ENV = 'production'
    debug.log('test log')
    expect(console.log).not.toHaveBeenCalled()
  })

  // 应在开发环境中输出错误 / Should output errors in development environment
  it('should output errors in development environment', () => {
    process.env.NODE_ENV = 'development'
    debug.error('test error')
    expect(console.error).toHaveBeenCalledWith('test error')
  })

  // 应在开发环境中输出警告 / Should output warnings in development environment
  it('should output warnings in development environment', () => {
    process.env.NODE_ENV = 'development'
    debug.warn('test warning')
    expect(console.warn).toHaveBeenCalledWith('test warning')
  })
}) 