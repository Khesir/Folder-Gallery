import './fabControls.css'

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20">
      <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FabControls({ onCreateFolder }) {
  return (
    <div className="fab-controls">
      <button className="fab-toggle" aria-label="Create folder" onClick={onCreateFolder}>
        <PlusIcon />
      </button>
    </div>
  )
}

export default FabControls
