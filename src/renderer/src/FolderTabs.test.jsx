import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FolderTabs from './FolderTabs'

function renderTabs(overrides = {}) {
  const props = {
    folders: [],
    activeFolder: null,
    onAddFolder: vi.fn(),
    onSelectFolder: vi.fn(),
    onRemoveFolder: vi.fn(),
    ...overrides
  }
  const utils = render(<FolderTabs {...props} />)
  return { ...utils, props }
}

describe('FolderTabs', () => {
  it('renders only the add button when there are no folders', () => {
    renderTabs()

    expect(screen.getByRole('button', { name: /add folder/i })).toBeInTheDocument()
    expect(screen.queryByText('|')).not.toBeInTheDocument()
  })

  it('renders a tab with the folder name (not the full path) for each folder', () => {
    renderTabs({ folders: ['C:\\Users\\example\\Pictures', 'D:\\Photos'], activeFolder: 'D:\\Photos' })

    expect(screen.getByText('Pictures')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
  })

  it('marks the active folder tab', () => {
    renderTabs({ folders: ['C:\\Users\\example\\Pictures'], activeFolder: 'C:\\Users\\example\\Pictures' })

    expect(screen.getByText('Pictures').closest('button')).toHaveClass('folder-tab-active')
  })

  it('calls onSelectFolder with the folder path when a tab is clicked', () => {
    const { props } = renderTabs({
      folders: ['C:\\Users\\example\\Pictures', 'D:\\Photos'],
      activeFolder: 'D:\\Photos'
    })

    fireEvent.click(screen.getByText('Pictures'))

    expect(props.onSelectFolder).toHaveBeenCalledWith('C:\\Users\\example\\Pictures')
  })

  it('calls onAddFolder when the add button is clicked', () => {
    const { props } = renderTabs()

    fireEvent.click(screen.getByRole('button', { name: /add folder/i }))

    expect(props.onAddFolder).toHaveBeenCalled()
  })

  it('calls onRemoveFolder without triggering onSelectFolder when the close icon is clicked', () => {
    const { props } = renderTabs({
      folders: ['C:\\Users\\example\\Pictures'],
      activeFolder: 'C:\\Users\\example\\Pictures'
    })

    fireEvent.click(screen.getByRole('button', { name: /close pictures/i }))

    expect(props.onRemoveFolder).toHaveBeenCalledWith('C:\\Users\\example\\Pictures')
    expect(props.onSelectFolder).not.toHaveBeenCalled()
  })

  it('calls onRemoveFolder when a tab is middle-clicked', () => {
    const { props } = renderTabs({
      folders: ['C:\\Users\\example\\Pictures'],
      activeFolder: 'C:\\Users\\example\\Pictures'
    })

    fireEvent(
      screen.getByText('Pictures').closest('button'),
      new MouseEvent('auxclick', { bubbles: true, button: 1 })
    )

    expect(props.onRemoveFolder).toHaveBeenCalledWith('C:\\Users\\example\\Pictures')
  })

  it('does not call onRemoveFolder for a right-click (auxclick with a different button)', () => {
    const { props } = renderTabs({
      folders: ['C:\\Users\\example\\Pictures'],
      activeFolder: 'C:\\Users\\example\\Pictures'
    })

    fireEvent(
      screen.getByText('Pictures').closest('button'),
      new MouseEvent('auxclick', { bubbles: true, button: 2 })
    )

    expect(props.onRemoveFolder).not.toHaveBeenCalled()
  })
})
