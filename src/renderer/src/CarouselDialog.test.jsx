import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CarouselDialog from './CarouselDialog'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'

const items = [
  { name: 'a.jpg', path: 'C:\\Trip\\a.jpg', isImage: true, isVideo: false, extension: '.jpg' },
  { name: 'b.png', path: 'C:\\Trip\\b.png', isImage: true, isVideo: false, extension: '.png' },
  { name: 'c.xyz', path: 'C:\\Trip\\c.xyz', isImage: false, isVideo: false, extension: '.xyz' }
]

const itemsWithVideo = [
  ...items,
  { name: 'd.mp4', path: 'C:\\Trip\\d.mp4', isImage: false, isVideo: true, extension: '.mp4' }
]

function mainImage() {
  return screen.getByTestId('carousel-main-image')
}

describe('CarouselDialog', () => {
  it('renders the first image as the current slide using the thumbnail (not full-resolution) src', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    const image = mainImage()
    expect(image.getAttribute('alt')).toBe('a.jpg')
    expect(image.getAttribute('src')).toBe(toThumbnailUrl('C:\\Trip\\a.jpg'))
  })

  it('renders the zoomed lightbox image using the full-resolution src', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    fireEvent.click(mainImage())

    const lightboxImage = screen.getByTestId('carousel-lightbox').querySelector('img')
    expect(lightboxImage.getAttribute('src')).toBe(toFileUrl('C:\\Trip\\a.jpg'))
  })

  it('lists non-image files separately instead of including them in the carousel', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    expect(screen.getByTestId('file-icon')).toBeInTheDocument()
    expect(screen.getByText('c.xyz')).toBeInTheDocument()
    expect(mainImage().getAttribute('alt')).toBe('a.jpg')
  })

  it('navigates forward and back through images only', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    expect(mainImage().getAttribute('alt')).toBe('a.jpg')

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mainImage().getAttribute('alt')).toBe('b.png')

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mainImage().getAttribute('alt')).toBe('a.jpg')

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(mainImage().getAttribute('alt')).toBe('b.png')
  })

  it('jumps to an image when its thumbnail is clicked', () => {
    const { container } = render(
      <CarouselDialog folderName="Trip" items={items} onClose={() => {}} />
    )

    const thumbnails = within(container.querySelector('.carousel-dialog-thumbnails'))
    fireEvent.click(thumbnails.getByAltText('b.png'))

    expect(mainImage().getAttribute('alt')).toBe('b.png')
  })

  it('calls onOpenFullPageView when the view full page button is clicked', () => {
    const onOpenFullPageView = vi.fn()
    render(
      <CarouselDialog
        folderName="Trip"
        items={items}
        onClose={() => {}}
        onOpenFullPageView={onOpenFullPageView}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /view full page/i }))

    expect(onOpenFullPageView).toHaveBeenCalled()
  })

  it('clicking an image zooms it into a lightbox view', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    fireEvent.click(mainImage())

    expect(screen.getByTestId('carousel-lightbox')).toBeInTheDocument()
  })

  it('keeps next/prev navigation working while zoomed, moving between items', () => {
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    fireEvent.click(mainImage())
    expect(screen.getByTestId('carousel-lightbox')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    const lightbox = screen.getByTestId('carousel-lightbox')
    expect(lightbox.querySelector('img').getAttribute('alt')).toBe('b.png')
  })

  it('calls window.api.openFile with the correct path when a non-image file row is clicked', () => {
    window.api = { openFile: vi.fn().mockResolvedValue('') }
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    fireEvent.click(screen.getByText('c.xyz'))

    expect(window.api.openFile).toHaveBeenCalledWith('C:\\Trip\\c.xyz')
  })

  it('shows an error message when openFile fails', async () => {
    window.api = { openFile: vi.fn().mockResolvedValue('No application found to open this file') }
    render(<CarouselDialog folderName="Trip" items={items} onClose={() => {}} />)

    fireEvent.click(screen.getByText('c.xyz'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No application found to open this file'
    )
  })

  it('closes when clicking outside the drawer', () => {
    const onClose = vi.fn()
    render(<CarouselDialog folderName="Trip" items={items} onClose={onClose} />)

    fireEvent.click(screen.getByRole('dialog', { name: 'Trip' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not close when clicking inside the drawer', () => {
    const onClose = vi.fn()
    render(<CarouselDialog folderName="Trip" items={items} onClose={onClose} />)

    fireEvent.click(mainImage())

    expect(onClose).not.toHaveBeenCalled()
  })

  it('plays a video in the main display, using the full-resolution src, instead of listing it as an other file', () => {
    render(<CarouselDialog folderName="Trip" items={itemsWithVideo} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    const video = screen.getByTestId('carousel-main-video')
    expect(video.tagName).toBe('VIDEO')
    expect(video.getAttribute('src')).toBe(toFileUrl('C:\\Trip\\d.mp4'))
    expect(screen.queryByText('d.mp4', { selector: '.carousel-dialog-other-file span' })).not.toBeInTheDocument()
  })

  it('jumps straight to a video when its thumbnail is clicked', () => {
    render(<CarouselDialog folderName="Trip" items={itemsWithVideo} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: 'd.mp4' }))

    expect(screen.getByTestId('carousel-main-video')).toBeInTheDocument()
    expect(screen.queryByTestId('carousel-main-image')).not.toBeInTheDocument()
  })

  it('sets the current item as the folder cover and refreshes it once saved', async () => {
    window.api = {
      getFolderMetadata: vi.fn().mockResolvedValue({ cover: null, description: '', tags: [] }),
      saveFolderMetadata: vi.fn().mockImplementation((_path, metadata) => Promise.resolve(metadata))
    }
    const onMetadataChanged = vi.fn()

    render(
      <CarouselDialog
        folderName="Trip"
        folderPath={'C:\\Trip'}
        items={items}
        onClose={() => {}}
        onMetadataChanged={onMetadataChanged}
      />
    )

    const setCoverButton = await screen.findByRole('button', { name: /set as cover/i })
    fireEvent.click(setCoverButton)

    await vi.waitFor(() => {
      expect(window.api.saveFolderMetadata).toHaveBeenCalledWith('C:\\Trip', {
        cover: 'a.jpg',
        description: '',
        tags: []
      })
    })
    await vi.waitFor(() => {
      expect(onMetadataChanged).toHaveBeenCalled()
    })
    expect(await screen.findByRole('button', { name: /current cover/i })).toBeInTheDocument()
  })

  it('shows a fallback with an "Open with default app" action when the video fails to decode', () => {
    window.api = { openFile: vi.fn().mockResolvedValue('') }

    render(<CarouselDialog folderName="Trip" items={itemsWithVideo} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    fireEvent.error(screen.getByTestId('carousel-main-video'))

    expect(screen.getByTestId('carousel-video-unsupported')).toBeInTheDocument()
    expect(screen.queryByTestId('carousel-main-video')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open with default app/i }))
    expect(window.api.openFile).toHaveBeenCalledWith('C:\\Trip\\d.mp4')
  })

  it('opens the folder in the OS file manager when the button is clicked', () => {
    window.api = {
      openInFileManager: vi.fn(),
      getFolderMetadata: vi.fn().mockResolvedValue({ cover: null, description: '', tags: [] })
    }

    render(<CarouselDialog folderName="Trip" folderPath={'C:\\Trip'} items={items} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /open in file explorer/i }))

    expect(window.api.openInFileManager).toHaveBeenCalledWith('C:\\Trip')
  })

  it('shows subfolders with their thumbnail and opens them via onOpenSubfolder when clicked', () => {
    const onOpenSubfolder = vi.fn()
    const itemsWithFolder = [
      ...items,
      {
        name: 'Cissia',
        path: 'C:\\Trip\\Cissia',
        isDirectory: true,
        isImage: false,
        isVideo: false,
        extension: '',
        thumbnail: 'C:\\Trip\\Cissia\\cover.jpg',
        thumbnailIsVideo: false
      }
    ]

    render(
      <CarouselDialog
        folderName="Trip"
        items={itemsWithFolder}
        onClose={() => {}}
        onOpenSubfolder={onOpenSubfolder}
      />
    )

    const folderButton = screen.getByRole('button', { name: /Cissia/ })
    expect(within(folderButton).getByAltText('Cissia').getAttribute('src')).toBe(
      toThumbnailUrl('C:\\Trip\\Cissia\\cover.jpg')
    )

    fireEvent.click(folderButton)

    expect(onOpenSubfolder).toHaveBeenCalledWith(itemsWithFolder[3])
  })
})
