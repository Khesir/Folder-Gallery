import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CreateFolderDialog from './CreateFolderDialog'

beforeEach(() => {
  window.api = {
    selectFiles: vi.fn(),
    createFolderWithFiles: vi.fn()
  }
})

describe('CreateFolderDialog', () => {
  it('disables Create when no folder name has been entered', () => {
    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={() => {}} />)

    expect(screen.getByRole('button', { name: /^create$/i })).toBeDisabled()
  })

  it('enables Create once a folder name is typed', () => {
    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={() => {}} />)

    fireEvent.change(screen.getByLabelText(/folder name/i), { target: { value: 'Trip' } })

    expect(screen.getByRole('button', { name: /^create$/i })).toBeEnabled()
  })

  it('calls window.api.selectFiles and shows the selected file count', async () => {
    window.api.selectFiles.mockResolvedValue(['C:\\Photos\\a.jpg', 'C:\\Photos\\b.jpg'])

    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /choose files/i }))

    expect(await screen.findByText('2 files selected')).toBeInTheDocument()
  })

  it('calls window.api.createFolderWithFiles with the root folder, name, and selected files', async () => {
    window.api.selectFiles.mockResolvedValue(['C:\\Photos\\a.jpg'])
    window.api.createFolderWithFiles.mockResolvedValue({ success: true, path: 'C:\\Photos\\Trip' })

    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={() => {}} />)

    fireEvent.change(screen.getByLabelText(/folder name/i), { target: { value: 'Trip' } })
    fireEvent.click(screen.getByRole('button', { name: /choose files/i }))
    await screen.findByText('1 file selected')

    fireEvent.click(screen.getByRole('button', { name: /^create$/i }))

    await vi.waitFor(() => {
      expect(window.api.createFolderWithFiles).toHaveBeenCalledWith('C:\\Photos', 'Trip', [
        'C:\\Photos\\a.jpg'
      ])
    })
  })

  it('calls onCreated when creation succeeds', async () => {
    window.api.createFolderWithFiles.mockResolvedValue({ success: true, path: 'C:\\Photos\\Trip' })
    const onCreated = vi.fn()

    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={onCreated} />)

    fireEvent.change(screen.getByLabelText(/folder name/i), { target: { value: 'Trip' } })
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }))

    await vi.waitFor(() => {
      expect(onCreated).toHaveBeenCalled()
    })
  })

  it('shows an inline error and does not call onCreated when the name already exists', async () => {
    window.api.createFolderWithFiles.mockResolvedValue({
      success: false,
      error: 'A folder with this name already exists'
    })
    const onCreated = vi.fn()

    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={() => {}} onCreated={onCreated} />)

    fireEvent.change(screen.getByLabelText(/folder name/i), { target: { value: 'Trip' } })
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A folder with this name already exists'
    )
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<CreateFolderDialog rootFolder="C:\Photos" onClose={onClose} onCreated={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /close/i }))

    expect(onClose).toHaveBeenCalled()
  })
})
