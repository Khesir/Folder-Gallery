import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FabControls from './FabControls'

describe('FabControls', () => {
  it('calls onCreateFolder when clicked', () => {
    const onCreateFolder = vi.fn()
    render(<FabControls onCreateFolder={onCreateFolder} />)

    fireEvent.click(screen.getByRole('button', { name: /create folder/i }))

    expect(onCreateFolder).toHaveBeenCalled()
  })
})
