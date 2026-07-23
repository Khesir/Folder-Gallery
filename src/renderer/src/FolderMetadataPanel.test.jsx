import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FolderMetadataPanel from './FolderMetadataPanel'

function openEditor() {
  fireEvent.click(screen.getByRole('button', { name: /edit folder details/i }))
}

describe('FolderMetadataPanel', () => {
  it('is collapsed behind an edit icon by default, showing no form fields', () => {
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: 'Summer trip', tags: ['summer', 'beach'] }}
        onSaveDetails={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: /edit folder details/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Summer trip')).not.toBeInTheDocument()
  })

  it('pre-fills the description and comma-joined tags once the edit icon is clicked', () => {
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: 'Summer trip', tags: ['summer', 'beach'] }}
        onSaveDetails={() => {}}
      />
    )

    openEditor()

    expect(screen.getByLabelText(/description/i)).toHaveValue('Summer trip')
    expect(screen.getByLabelText(/tags/i)).toHaveValue('summer, beach')
  })

  it('calls onSaveDetails with the edited description and parsed, trimmed tags, then collapses', () => {
    const onSaveDetails = vi.fn()
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={onSaveDetails}
      />
    )

    openEditor()
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A note' } })
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'one, two ,  three' } })
    fireEvent.click(screen.getByRole('button', { name: /save details/i }))

    expect(onSaveDetails).toHaveBeenCalledWith({
      description: 'A note',
      tags: ['one', 'two', 'three']
    })
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('drops empty tag entries produced by trailing commas', () => {
    const onSaveDetails = vi.fn()
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={onSaveDetails}
      />
    )

    openEditor()
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'one,,two,' } })
    fireEvent.click(screen.getByRole('button', { name: /save details/i }))

    expect(onSaveDetails).toHaveBeenCalledWith({ description: '', tags: ['one', 'two'] })
  })

  it('closes the form without saving when the close button is clicked', () => {
    const onSaveDetails = vi.fn()
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={onSaveDetails}
      />
    )

    openEditor()
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Discarded' } })
    fireEvent.click(screen.getByRole('button', { name: /close folder details/i }))

    expect(onSaveDetails).not.toHaveBeenCalled()
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('opens as a dialog', () => {
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={() => {}}
      />
    )

    openEditor()

    expect(screen.getByRole('dialog', { name: /folder details/i })).toBeInTheDocument()
  })

  it('closes without saving when clicking outside the dialog', () => {
    const onSaveDetails = vi.fn()
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={onSaveDetails}
      />
    )

    openEditor()
    fireEvent.click(screen.getByRole('dialog', { name: /folder details/i }))

    expect(onSaveDetails).not.toHaveBeenCalled()
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('does not close when clicking inside the dialog', () => {
    render(
      <FolderMetadataPanel
        metadata={{ cover: null, description: '', tags: [] }}
        onSaveDetails={() => {}}
      />
    )

    openEditor()
    fireEvent.click(screen.getByLabelText(/description/i))

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })
})
