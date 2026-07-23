import { describe, it, expect } from 'vitest'
import { filterAndSortFolders } from './filterAndSortFolders'

describe('filterAndSortFolders', () => {
  const folders = [
    { name: 'Beach Trip', path: '/root/Beach Trip', thumbnail: null, modifiedAt: 200 },
    { name: 'archive', path: '/root/archive', thumbnail: null, modifiedAt: 300 },
    { name: 'Cats', path: '/root/Cats', thumbnail: null, modifiedAt: 100 }
  ]

  it('filters out folders not matching the substring', () => {
    const result = filterAndSortFolders(folders, { filterText: 'beach', sortOption: 'name-asc' })

    expect(result).toEqual([folders[0]])
  })

  it('matches case-insensitively', () => {
    const result = filterAndSortFolders(folders, { filterText: 'CATS', sortOption: 'name-asc' })

    expect(result).toEqual([folders[2]])
  })

  it('returns all folders when filterText is empty', () => {
    const result = filterAndSortFolders(folders, { filterText: '', sortOption: 'name-asc' })

    expect(result).toHaveLength(3)
  })

  it('sorts alphabetically ascending by default', () => {
    const result = filterAndSortFolders(folders, { filterText: '', sortOption: 'name-asc' })

    expect(result.map((f) => f.name)).toEqual(['archive', 'Beach Trip', 'Cats'])
  })

  it('sorts by modified date descending when sortOption is modified-desc', () => {
    const result = filterAndSortFolders(folders, { filterText: '', sortOption: 'modified-desc' })

    expect(result.map((f) => f.name)).toEqual(['archive', 'Beach Trip', 'Cats'])
  })

  it('combines filter and sort together', () => {
    const result = filterAndSortFolders(folders, { filterText: 'a', sortOption: 'modified-desc' })

    expect(result.map((f) => f.name)).toEqual(['archive', 'Beach Trip', 'Cats'])
  })
})
