import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFolderMetadata } from './useFolderMetadata'

const folderPath = 'C:\\Trip'

beforeEach(() => {
  window.api = {
    getFolderMetadata: vi.fn().mockResolvedValue({ cover: null, description: '', tags: [] }),
    saveFolderMetadata: vi.fn().mockImplementation((_path, metadata) => Promise.resolve(metadata))
  }
})

describe('useFolderMetadata', () => {
  it('loads metadata for the given folder path on mount', async () => {
    window.api.getFolderMetadata.mockResolvedValue({
      cover: 'photo.jpg',
      description: 'Trip',
      tags: ['a']
    })

    const { result } = renderHook(() => useFolderMetadata(folderPath))

    await waitFor(() => {
      expect(result.current.metadata).toEqual({ cover: 'photo.jpg', description: 'Trip', tags: ['a'] })
    })
    expect(window.api.getFolderMetadata).toHaveBeenCalledWith(folderPath)
  })

  it('does not call the API when folderPath is falsy', () => {
    renderHook(() => useFolderMetadata(null))

    expect(window.api.getFolderMetadata).not.toHaveBeenCalled()
  })

  it('setCover merges the new cover into existing metadata and persists it', async () => {
    window.api.getFolderMetadata.mockResolvedValue({
      cover: null,
      description: 'Trip',
      tags: ['a']
    })

    const { result } = renderHook(() => useFolderMetadata(folderPath))
    await waitFor(() => expect(result.current.metadata.description).toBe('Trip'))

    await act(async () => {
      await result.current.setCover('new-cover.jpg')
    })

    expect(window.api.saveFolderMetadata).toHaveBeenCalledWith(folderPath, {
      cover: 'new-cover.jpg',
      description: 'Trip',
      tags: ['a']
    })
    expect(result.current.metadata.cover).toBe('new-cover.jpg')
  })

  it('saveDetails merges description and tags into existing metadata and persists it', async () => {
    window.api.getFolderMetadata.mockResolvedValue({
      cover: 'photo.jpg',
      description: '',
      tags: []
    })

    const { result } = renderHook(() => useFolderMetadata(folderPath))
    await waitFor(() => expect(result.current.metadata.cover).toBe('photo.jpg'))

    await act(async () => {
      await result.current.saveDetails({ description: 'Updated', tags: ['x', 'y'] })
    })

    expect(window.api.saveFolderMetadata).toHaveBeenCalledWith(folderPath, {
      cover: 'photo.jpg',
      description: 'Updated',
      tags: ['x', 'y']
    })
  })
})
