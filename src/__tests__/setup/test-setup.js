import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 每个测试后自动清理 / Automatically clean up after each test
afterEach(() => {
  cleanup()
}) 