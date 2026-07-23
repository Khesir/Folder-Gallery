import { useWindowMaximized } from './useWindowMaximized'
import './titleBar.css'

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10">
      <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function MaximizeIcon() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10">
      <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10">
      <rect x="2.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M0.5 2.5h7v7h-7z" fill="var(--panel)" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10">
      <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12">
      <circle cx="8" cy="8" r="3.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M8 0.5v2M8 13.5v2M15.5 8h-2M2.5 8h-2M13.4 2.6l-1.4 1.4M4 12l-1.4 1.4M13.4 13.4l-1.4-1.4M4 4L2.6 2.6" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12">
      <path
        d="M13.5 9.8A6 6 0 0 1 6.2 2.5a6 6 0 1 0 7.3 7.3z"
        fill="currentColor"
      />
    </svg>
  )
}

function AppIcon() {
  return (
    <svg className="title-bar-icon" viewBox="0 0 64 64" width="14" height="14" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#f5b246" />
      <g transform="rotate(45 32 32)">
        <path d="M32 15v34M15 32h34" stroke="#1a1410" strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function TitleBar({ theme, onToggleTheme }) {
  const isMaximized = useWindowMaximized()

  return (
    <div className="title-bar" onDoubleClick={() => window.api.toggleMaximizeWindow()}>
      <span className="title-bar-label">
        <AppIcon />
        Folder Gallery
      </span>
      <div className="title-bar-controls">
        {onToggleTheme ? (
          <button
            className="title-bar-button title-bar-theme-button"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </button>
        ) : null}
        <button
          className="title-bar-button"
          aria-label="Minimize"
          onClick={() => window.api.minimizeWindow()}
        >
          <MinimizeIcon />
        </button>
        <button
          className="title-bar-button"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          onClick={() => window.api.toggleMaximizeWindow()}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button
          className="title-bar-button title-bar-button-close"
          aria-label="Close"
          onClick={() => window.api.closeWindow()}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
