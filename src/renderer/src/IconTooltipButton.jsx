import './iconTooltipButton.css'

function IconTooltipButton({ icon, label, onClick, className = '', tooltipAlign = 'center' }) {
  return (
    <span className={`icon-tooltip-wrapper icon-tooltip-align-${tooltipAlign}`}>
      <button
        type="button"
        className={`icon-tooltip-button ${className}`.trim()}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </button>
      <span className="icon-tooltip-label" aria-hidden="true">
        {label}
      </span>
    </span>
  )
}

export default IconTooltipButton
