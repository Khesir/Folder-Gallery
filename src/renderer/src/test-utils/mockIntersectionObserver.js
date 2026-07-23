import { vi } from 'vitest'

export class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

MockIntersectionObserver.instances = []

export function triggerIntersection(instance, isIntersecting = true) {
  instance.callback([{ isIntersecting }])
}

export function findObserverByObservedTestId(testId) {
  return MockIntersectionObserver.instances.find((instance) =>
    instance.observe.mock.calls.some(([node]) => node?.dataset?.testid === testId)
  )
}
