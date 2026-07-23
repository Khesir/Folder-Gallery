import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { MockIntersectionObserver } from './src/renderer/src/test-utils/mockIntersectionObserver'

global.IntersectionObserver = MockIntersectionObserver

afterEach(() => {
  MockIntersectionObserver.instances = []
})
