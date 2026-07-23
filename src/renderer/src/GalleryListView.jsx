import { toThumbnailUrl } from './appFileUrl'
import './galleryListView.css'

function formatModifiedAt(folder) {
  return new Date(folder.modifiedAt).toLocaleString()
}

function GalleryListView({ folders, onOpenFolder }) {
  return (
    <table className="gallery-list-view">
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Files</th>
          <th>Modified</th>
        </tr>
      </thead>
      <tbody>
        {folders.map((folder) => (
          <tr
            key={folder.path}
            className="gallery-list-view-row"
            onClick={() => onOpenFolder?.(folder)}
          >
            <td>
              {folder.thumbnail ? (
                <img
                  className="gallery-list-view-thumb"
                  src={toThumbnailUrl(folder.thumbnail)}
                  alt={folder.name}
                />
              ) : (
                <div
                  className="gallery-list-view-thumb-placeholder"
                  data-testid="gallery-list-view-placeholder"
                />
              )}
            </td>
            <td>{folder.name}</td>
            <td>{folder.itemCount}</td>
            <td>{formatModifiedAt(folder)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default GalleryListView
