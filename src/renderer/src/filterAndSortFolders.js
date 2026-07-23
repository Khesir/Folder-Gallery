export const SORT_OPTIONS = {
  NAME_ASC: 'name-asc',
  MODIFIED_DESC: 'modified-desc'
}

function sortByOption(folders, sortOption) {
  const sorted = [...folders]

  if (sortOption === SORT_OPTIONS.MODIFIED_DESC) {
    return sorted.sort((a, b) => b.modifiedAt - a.modifiedAt)
  }

  return sorted.sort((a, b) => a.name.localeCompare(b.name))
}

export function filterAndSortFolders(folders, { filterText, sortOption }) {
  const normalizedFilter = filterText.trim().toLowerCase()

  const filtered = normalizedFilter
    ? folders.filter((folder) => folder.name.toLowerCase().includes(normalizedFilter))
    : folders

  return sortByOption(filtered, sortOption)
}
