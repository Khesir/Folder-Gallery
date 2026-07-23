import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Gallery from './Gallery'
import { VIEW_MODES } from './viewModes'
import { triggerIntersection, findObserverByObservedTestId } from './test-utils/mockIntersectionObserver'

function makeFolders(count) {
  return Array.from({ length: count }, (_, i) => ({
    path: `C:\\Photos\\Folder${i}`,
    name: `Folder${i}`,
    thumbnail: null,
    itemCount: i,
    modifiedAt: new Date('2026-01-01T00:00:00Z').getTime()
  }))
}

describe('Gallery', () => {
  it('renders only an initial bounded window of cards when there are many folders', () => {
    render(<Gallery folders={makeFolders(500)} onOpenFolder={() => {}} />)

    const cards = screen.getAllByTestId('folder-card-placeholder')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThan(500)
  })

  it('renders more cards once the sentinel intersects the viewport', () => {
    render(<Gallery folders={makeFolders(500)} onOpenFolder={() => {}} />)

    const initialCount = screen.getAllByTestId('folder-card-placeholder').length
    const sentinelObserver = findObserverByObservedTestId('gallery-sentinel')

    act(() => triggerIntersection(sentinelObserver, true))

    const updatedCount = screen.getAllByTestId('folder-card-placeholder').length
    expect(updatedCount).toBeGreaterThan(initialCount)
  })

  it('renders every folder when the (filtered/sorted) list is smaller than the initial window', () => {
    render(<Gallery folders={makeFolders(5)} onOpenFolder={() => {}} />)

    expect(screen.getAllByTestId('folder-card-placeholder')).toHaveLength(5)
    expect(screen.queryByTestId('gallery-sentinel')).not.toBeInTheDocument()
  })

  it('resets the render window when a new filtered/sorted folder list is passed in', () => {
    const { rerender } = render(<Gallery folders={makeFolders(500)} onOpenFolder={() => {}} />)

    const sentinelObserver = findObserverByObservedTestId('gallery-sentinel')
    act(() => triggerIntersection(sentinelObserver, true))
    expect(screen.getAllByTestId('folder-card-placeholder').length).toBeGreaterThan(60)

    rerender(<Gallery folders={makeFolders(3)} onOpenFolder={() => {}} />)

    expect(screen.getAllByTestId('folder-card-placeholder')).toHaveLength(3)
  })

  it('renders folder cards in a uniform grid when viewMode is grid', () => {
    const { container } = render(
      <Gallery folders={makeFolders(3)} onOpenFolder={() => {}} viewMode={VIEW_MODES.GRID} />
    )

    expect(container.querySelector('.gallery-grid')).toBeInTheDocument()
    expect(screen.getAllByTestId('folder-card-placeholder')).toHaveLength(3)
  })

  it('renders a table when viewMode is list', () => {
    render(<Gallery folders={makeFolders(3)} onOpenFolder={() => {}} viewMode={VIEW_MODES.LIST} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Folder0')).toBeInTheDocument()
  })
})
