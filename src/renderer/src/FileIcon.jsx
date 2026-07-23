const EXTENSION_ICONS = {
  '.pdf': '📄',
  '.doc': '📝',
  '.docx': '📝',
  '.txt': '📃',
  '.mp4': '🎬',
  '.mov': '🎬',
  '.avi': '🎬',
  '.mp3': '🎵',
  '.wav': '🎵',
  '.zip': '🗜️',
  '.rar': '🗜️',
  '.xls': '📊',
  '.xlsx': '📊',
  '.ppt': '📽️',
  '.pptx': '📽️'
}

const FALLBACK_ICON = '📁'

function FileIcon({ extension, onClick }) {
  const icon = EXTENSION_ICONS[extension] ?? FALLBACK_ICON

  return (
    <div
      className="file-icon"
      data-testid="file-icon"
      role="img"
      aria-label={extension || 'file'}
      onClick={onClick}
    >
      <span>{icon}</span>
    </div>
  )
}

export default FileIcon
