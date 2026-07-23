import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import FullPageView from './FullPageView'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'

const rootPath = 'C:\\Trip'

const rootEntries = [
  {
    name: 'photo.jpg',
    path: 'C:\\Trip\\photo.jpg',
    isFile: true,
    isDirectory: false,
    isImage: true,
    isVideo: false,
    extension: '.jpg',
    thumbnail: null,
    thumbnailIsVideo: false,
    size: 2048,
    modifiedAt: new Date('2026-01-15T10:00:00Z').getTime()
  },
  {
    name: 'Subfolder',
    path: 'C:\\Trip\\Subfolder',
    isFile: false,
    isDirectory: true,
    isImage: false,
    isVideo: false,
    extension: '',
    thumbnail: 'C:\\Trip\\Subfolder\\cover.jpg',
    thumbnailIsVideo: false,
    size: 0,
    modifiedAt: new Date('2026-02-01T10:00:00Z').getTime()
  },
  {
    name: 'notes.txt',
    path: 'C:\\Trip\\notes.txt',
    isFile: true,
    isDirectory: false,
    isImage: false,
    isVideo: false,
    extension: '.txt',
    thumbnail: null,
    thumbnailIsVideo: false,
    size: 10,
    modifiedAt: new Date('2026-01-20T10:00:00Z').getTime()
  }
]

const subfolderEntries = [
  {
    name: 'SubSubfolder',
    path: 'C:\\Trip\\Subfolder\\SubSubfolder',
    isFile: false,
    isDirectory: true,
    isImage: false,
    isVideo: false,
    extension: '',
    thumbnail: null,
    thumbnailIsVideo: false,
    size: 0,
    modifiedAt: new Date('2026-03-01T10:00:00Z').getTime()
  }
]

const subSubfolderEntries = [
  {
    name: 'deep.txt',
    path: 'C:\\Trip\\Subfolder\\SubSubfolder\\deep.txt',
    isFile: true,
    isDirectory: false,
    isImage: false,
    isVideo: false,
    extension: '.txt',
    thumbnail: null,
    thumbnailIsVideo: false,
    size: 10,
    modifiedAt: new Date('2026-04-01T10:00:00Z').getTime()
  }
]

beforeEach(() => {
  window.api = {
    scanFolderContents: vi.fn().mockResolvedValue(rootEntries),
    openFile: vi.fn().mockResolvedValue(''),
    renameEntry: vi.fn(),
    deleteEntry: vi.fn(),
    getFolderMetadata: vi.fn().mockResolvedValue({ cover: null, description: '', tags: [] }),
    saveFolderMetadata: vi.fn().mockResolvedValue({ cover: null, description: '', tags: [] }),
    openInFileManager: vi.fn()
  }
})

function mediaTile(name) {
  return screen.getByAltText(name).closest('.full-page-view-media-tile')
}

function folderTile(name) {
  return screen.getByText(name).closest('.full-page-view-folder-tile')
}

function fileRow(name) {
  return screen.getByText(name).closest('.full-page-view-file-row')
}

describe('FullPageView', () => {
  it('picks up entries that arrive after the initial mount (async parent fetch)', () => {
    const { rerender } = render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={[]} onBack={() => {}} />
    )

    expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()

    rerender(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
  })

  it('renders an image file as a media tile using the thumbnail src', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    const image = screen.getByAltText('photo.jpg')
    expect(image.getAttribute('src')).toBe(toThumbnailUrl('C:\\Trip\\photo.jpg'))
  })

  it('renders a subfolder as a folder tile using its cover thumbnail', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    const image = within(folderTile('Subfolder')).getByRole('img')
    expect(image.getAttribute('src')).toBe(toThumbnailUrl('C:\\Trip\\Subfolder\\cover.jpg'))
  })

  it('renders a folder placeholder icon when a subfolder has no cover thumbnail', async () => {
    window.api.scanFolderContents.mockResolvedValueOnce(subfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))

    const tile = await screen.findByText('SubSubfolder')
    expect(tile.closest('.full-page-view-folder-tile').querySelector('img')).not.toBeInTheDocument()
  })

  it('lists a non-media file in the Files section', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    expect(screen.getByText('notes.txt')).toBeInTheDocument()
    expect(screen.getByTestId('file-icon')).toBeInTheDocument()
  })

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn()
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={onBack} />
    )

    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(onBack).toHaveBeenCalled()
  })

  it('drills into a clicked subfolder tile and shows its contents', async () => {
    window.api.scanFolderContents.mockResolvedValueOnce(subfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))

    await waitFor(() => {
      expect(window.api.scanFolderContents).toHaveBeenCalledWith('C:\\Trip\\Subfolder')
    })
    expect(await screen.findByText('SubSubfolder')).toBeInTheDocument()
    expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
  })

  it('drills 2 levels deep and reflects each breadcrumb label', async () => {
    window.api.scanFolderContents
      .mockResolvedValueOnce(subfolderEntries)
      .mockResolvedValueOnce(subSubfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))
    const subSubTile = await screen.findByText('SubSubfolder')

    fireEvent.click(subSubTile.closest('.full-page-view-folder-tile'))
    await screen.findByText('deep.txt')

    const breadcrumb = screen.getByRole('navigation')
    expect(within(breadcrumb).getByText('Trip')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('Subfolder')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('SubSubfolder')).toBeInTheDocument()
  })

  it('seeds the breadcrumb with the given parentPath when opened directly on a subfolder', () => {
    render(
      <FullPageView
        folderName="Cissia"
        folderPath="C:\\Domina\\Cissia"
        entries={[]}
        parentPath={[{ name: 'Domina', path: 'C:\\Domina' }]}
        onBack={() => {}}
      />
    )

    const breadcrumb = screen.getByRole('navigation')
    expect(within(breadcrumb).getByText('Domina')).toBeInTheDocument()
    expect(within(breadcrumb).getByText('Cissia')).toBeInTheDocument()
  })

  it('jumps back to a shallower level when its breadcrumb segment is clicked', async () => {
    window.api.scanFolderContents
      .mockResolvedValueOnce(subfolderEntries)
      .mockResolvedValueOnce(subSubfolderEntries)
      .mockResolvedValueOnce(subfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))
    const subSubTile = await screen.findByText('SubSubfolder')

    fireEvent.click(subSubTile.closest('.full-page-view-folder-tile'))
    await screen.findByText('deep.txt')

    const breadcrumb = screen.getByRole('navigation')
    fireEvent.click(within(breadcrumb).getByText('Subfolder'))

    await waitFor(() => {
      expect(window.api.scanFolderContents).toHaveBeenLastCalledWith('C:\\Trip\\Subfolder')
    })
    expect(await screen.findByText('SubSubfolder')).toBeInTheDocument()
    expect(screen.queryByText('deep.txt')).not.toBeInTheDocument()

    const narrowedBreadcrumb = screen.getByRole('navigation')
    expect(within(narrowedBreadcrumb).queryByText('SubSubfolder')).not.toBeInTheDocument()
  })

  it('does not re-fetch when clicking the current (deepest) breadcrumb segment', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    const breadcrumb = screen.getByRole('navigation')
    fireEvent.click(within(breadcrumb).getByText('Trip'))

    expect(window.api.scanFolderContents).not.toHaveBeenCalled()
  })

  it('opens the current folder in the OS file manager when the button is clicked', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(screen.getByRole('button', { name: /open in file explorer/i }))

    expect(window.api.openInFileManager).toHaveBeenCalledWith('C:\\Trip')
  })

  it('opens the nested subfolder (not the gallery root) in the OS file manager once drilled in', async () => {
    window.api.scanFolderContents.mockResolvedValueOnce(subfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))
    await screen.findByText('SubSubfolder')

    fireEvent.click(screen.getByRole('button', { name: /open in file explorer/i }))

    expect(window.api.openInFileManager).toHaveBeenCalledWith('C:\\Trip\\Subfolder')
  })

  it('single-clicking a media file selects it and shows its details in the side panel', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(mediaTile('photo.jpg'))

    const panel = screen.getByLabelText('File details')
    expect(within(panel).getByText('photo.jpg')).toBeInTheDocument()
    expect(within(panel).getByText('JPG')).toBeInTheDocument()
    expect(within(panel).getByText('2048 bytes')).toBeInTheDocument()
  })

  it('single-clicking a non-media file selects it and shows its details in the side panel', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(fileRow('notes.txt'))

    const panel = screen.getByLabelText('File details')
    expect(within(panel).getByText('notes.txt')).toBeInTheDocument()
    expect(within(panel).getByText('TXT')).toBeInTheDocument()
  })

  it('does not show carousel nav buttons when only one media file is present', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(mediaTile('photo.jpg'))

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
  })

  it('navigates to the next and previous media file from the details panel', () => {
    const secondImage = {
      name: 'sunset.jpg',
      path: 'C:\\Trip\\sunset.jpg',
      isFile: true,
      isDirectory: false,
      isImage: true,
      isVideo: false,
      extension: '.jpg',
      thumbnail: null,
      thumbnailIsVideo: false,
      size: 4096,
      modifiedAt: new Date('2026-01-16T10:00:00Z').getTime()
    }

    render(
      <FullPageView
        folderName="Trip"
        folderPath={rootPath}
        entries={[...rootEntries, secondImage]}
        onBack={() => {}}
      />
    )

    fireEvent.click(mediaTile('photo.jpg'))

    let panel = screen.getByLabelText('File details')
    expect(within(panel).getByText('photo.jpg')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    panel = screen.getByLabelText('File details')
    expect(within(panel).getByText('sunset.jpg')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))

    panel = screen.getByLabelText('File details')
    expect(within(panel).getByText('photo.jpg')).toBeInTheDocument()
  })

  it('does not show a details panel before anything is selected', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    expect(screen.queryByLabelText('File details')).not.toBeInTheDocument()
  })

  it('double-clicking a media file tile opens it with the OS default app', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.doubleClick(mediaTile('photo.jpg'))

    expect(window.api.openFile).toHaveBeenCalledWith('C:\\Trip\\photo.jpg')
  })

  it('double-clicking a folder tile does not try to open it as a file', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.doubleClick(folderTile('Subfolder'))

    expect(window.api.openFile).not.toHaveBeenCalled()
  })

  it('shows an inline error when opening a file fails', async () => {
    window.api.openFile.mockResolvedValue('No application found to open this file')

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.doubleClick(mediaTile('photo.jpg'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No application found to open this file'
    )
  })

  it('right-clicking a tile opens a context menu with Rename and Delete', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))

    expect(screen.getByRole('button', { name: /rename/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows Set as cover in the context menu for a file at the gallery root', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))

    expect(screen.getByRole('button', { name: /set as cover/i })).toBeInTheDocument()
  })

  it('does not show Set as cover for a non-media file', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(fileRow('notes.txt'))

    expect(screen.queryByRole('button', { name: /set as cover/i })).not.toBeInTheDocument()
  })

  it('does not show Set as cover for a folder entry', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(folderTile('Subfolder'))

    expect(screen.queryByRole('button', { name: /set as cover/i })).not.toBeInTheDocument()
  })

  it('does not show Set as cover once nested inside a subfolder', async () => {
    window.api.scanFolderContents.mockResolvedValueOnce(subfolderEntries)

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.click(folderTile('Subfolder'))
    const subSubTile = await screen.findByText('SubSubfolder')

    fireEvent.contextMenu(subSubTile.closest('.full-page-view-folder-tile'))

    expect(screen.queryByRole('button', { name: /set as cover/i })).not.toBeInTheDocument()
  })

  it('renames an entry and refreshes the list on success', async () => {
    window.api.renameEntry.mockResolvedValue({ success: true, path: 'C:\\Trip\\renamed.jpg' })
    window.api.scanFolderContents.mockResolvedValueOnce([
      { ...rootEntries[0], name: 'renamed.jpg', path: 'C:\\Trip\\renamed.jpg' },
      rootEntries[1],
      rootEntries[2]
    ])

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /rename/i }))

    const input = screen.getByDisplayValue('photo.jpg')
    fireEvent.change(input, { target: { value: 'renamed.jpg' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await vi.waitFor(() => {
      expect(window.api.renameEntry).toHaveBeenCalledWith('C:\\Trip\\photo.jpg', 'renamed.jpg')
    })
    expect(await screen.findByAltText('renamed.jpg')).toBeInTheDocument()
  })

  it('shows an inline error and keeps editing when rename fails', async () => {
    window.api.renameEntry.mockResolvedValue({
      success: false,
      error: 'A file or folder with this name already exists'
    })

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /rename/i }))

    const input = screen.getByDisplayValue('photo.jpg')
    fireEvent.change(input, { target: { value: 'Subfolder' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A file or folder with this name already exists'
    )
  })

  it('cancels renaming when Escape is pressed', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /rename/i }))

    const input = screen.getByDisplayValue('photo.jpg')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByDisplayValue('photo.jpg')).not.toBeInTheDocument()
    expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
  })

  it('shows a confirm dialog before deleting, and does nothing until confirmed', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByRole('dialog', { name: /confirm delete/i })).toBeInTheDocument()
    expect(window.api.deleteEntry).not.toHaveBeenCalled()
  })

  it('deletes the entry and refreshes the list when confirmed', async () => {
    window.api.deleteEntry.mockResolvedValue({ success: true })
    window.api.scanFolderContents.mockResolvedValueOnce([rootEntries[1], rootEntries[2]])

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    const dialog = screen.getByRole('dialog', { name: /confirm delete/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await vi.waitFor(() => {
      expect(window.api.deleteEntry).toHaveBeenCalledWith('C:\\Trip\\photo.jpg')
    })
    await waitFor(() => {
      expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
    })
  })

  it('cancelling the delete confirmation does not call deleteEntry', () => {
    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={rootEntries} onBack={() => {}} />
    )

    fireEvent.contextMenu(mediaTile('photo.jpg'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    const dialog = screen.getByRole('dialog', { name: /confirm delete/i })
    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(window.api.deleteEntry).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: /confirm delete/i })).not.toBeInTheDocument()
  })

  it('plays a video file inline in the details panel using the full-resolution src', () => {
    const videoEntries = [
      {
        name: 'clip.mp4',
        path: 'C:\\Trip\\clip.mp4',
        isFile: true,
        isDirectory: false,
        isImage: false,
        isVideo: true,
        extension: '.mp4',
        thumbnail: null,
        thumbnailIsVideo: false,
        size: 4096,
        modifiedAt: new Date('2026-01-15T10:00:00Z').getTime()
      }
    ]

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={videoEntries} onBack={() => {}} />
    )

    fireEvent.click(document.querySelector('.full-page-view-media-tile'))

    const panel = screen.getByLabelText('File details')
    const videoEl = panel.querySelector('video')
    expect(videoEl.getAttribute('src')).toBe(toFileUrl('C:\\Trip\\clip.mp4'))
  })

  it('shows a fallback with an "Open with default app" action when a video fails to decode', () => {
    const videoEntries = [
      {
        name: 'clip.mp4',
        path: 'C:\\Trip\\clip.mp4',
        isFile: true,
        isDirectory: false,
        isImage: false,
        isVideo: true,
        extension: '.mp4',
        thumbnail: null,
        thumbnailIsVideo: false,
        size: 4096,
        modifiedAt: new Date('2026-01-15T10:00:00Z').getTime()
      }
    ]

    render(
      <FullPageView folderName="Trip" folderPath={rootPath} entries={videoEntries} onBack={() => {}} />
    )

    fireEvent.click(document.querySelector('.full-page-view-media-tile'))

    const panel = screen.getByLabelText('File details')
    fireEvent.error(panel.querySelector('video'))

    expect(panel.querySelector('video')).not.toBeInTheDocument()
    fireEvent.click(within(panel).getByRole('button', { name: /open with default app/i }))
    expect(window.api.openFile).toHaveBeenCalledWith('C:\\Trip\\clip.mp4')
  })
})
