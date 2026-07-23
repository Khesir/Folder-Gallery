import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GalleryControls from './GalleryControls'
import { VIEW_MODES } from './viewModes'

function renderControls(overrides = {}) {
  const props = {
    filterText: '',
    onFilterTextChange: vi.fn(),
    sortOption: 'name-asc',
    onSortOptionChange: vi.fn(),
    viewMode: VIEW_MODES.MASONRY,
    onViewModeChange: vi.fn(),
    activeFolder: 'C:\\Trip',
    folderCount: 0,
    ...overrides
  }
  const utils = render(<GalleryControls {...props} />)
  return { ...utils, props }
}

describe('GalleryControls', () => {
  it('calls onFilterTextChange as the user types', () => {
    const { props } = renderControls()

    fireEvent.change(screen.getByLabelText('Filter folders'), { target: { value: 'a' } })

    expect(props.onFilterTextChange).toHaveBeenCalledWith('a')
  })

  it('calls onSortOptionChange when the sort select changes', () => {
    const { props } = renderControls()

    fireEvent.change(screen.getByLabelText('Sort folders'), { target: { value: 'modified-desc' } })

    expect(props.onSortOptionChange).toHaveBeenCalledWith('modified-desc')
  })

  it('renders the view mode buttons beside the sort control', () => {
    renderControls()

    const group = screen.getByRole('group', { name: /view mode/i })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masonry view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument()
  })

  it('calls onViewModeChange when a view mode button is clicked', () => {
    const { props } = renderControls()

    fireEvent.click(screen.getByRole('button', { name: /grid view/i }))

    expect(props.onViewModeChange).toHaveBeenCalledWith(VIEW_MODES.GRID)
  })

  it('marks the active view mode button', () => {
    renderControls({ viewMode: VIEW_MODES.LIST })

    expect(screen.getByRole('button', { name: /list view/i })).toHaveClass(
      'gallery-view-mode-button-active'
    )
  })

  it('shows the pluralized folder count', () => {
    renderControls({ folderCount: 5 })

    expect(screen.getByText('5 folders')).toBeInTheDocument()
  })

  it('shows the singular folder count', () => {
    renderControls({ folderCount: 1 })

    expect(screen.getByText('1 folder')).toBeInTheDocument()
  })

  it('opens the active folder in the OS file manager when the icon is clicked', () => {
    window.api = { openInFileManager: vi.fn() }
    renderControls({ activeFolder: 'C:\\Trip' })

    fireEvent.click(screen.getByRole('button', { name: /open in file explorer/i }))

    expect(window.api.openInFileManager).toHaveBeenCalledWith('C:\\Trip')
  })
})
