import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GalleryListView from './GalleryListView'
import { toThumbnailUrl } from './appFileUrl'

const folders = [
  {
    name: 'Trip',
    path: 'C:\\Photos\\Trip',
    thumbnail: 'C:\\Photos\\Trip\\photo.jpg',
    itemCount: 3,
    modifiedAt: new Date('2026-01-15T10:00:00Z').getTime()
  },
  {
    name: 'Docs',
    path: 'C:\\Photos\\Docs',
    thumbnail: null,
    itemCount: 0,
    modifiedAt: new Date('2026-02-01T10:00:00Z').getTime()
  }
]

describe('GalleryListView', () => {
  it('renders a row with name, file count, and thumbnail image', () => {
    render(<GalleryListView folders={folders} onOpenFolder={() => {}} />)

    const row = screen.getByText('Trip').closest('tr')
    expect(row).toHaveTextContent('3')
    const image = row.querySelector('img')
    expect(image.getAttribute('src')).toBe(toThumbnailUrl('C:\\Photos\\Trip\\photo.jpg'))
  })

  it('renders a placeholder instead of an image when thumbnail is null', () => {
    render(<GalleryListView folders={folders} onOpenFolder={() => {}} />)

    const row = screen.getByText('Docs').closest('tr')
    expect(row.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('gallery-list-view-placeholder')).toBeInTheDocument()
  })

  it('calls onOpenFolder with the folder when a row is clicked', () => {
    const onOpenFolder = vi.fn()
    render(<GalleryListView folders={folders} onOpenFolder={onOpenFolder} />)

    fireEvent.click(screen.getByText('Trip').closest('tr'))

    expect(onOpenFolder).toHaveBeenCalledWith(folders[0])
  })
})
