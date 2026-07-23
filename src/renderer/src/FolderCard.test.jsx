import { describe, it, expect, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import FolderCard from './FolderCard'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'
import { MockIntersectionObserver, triggerIntersection } from './test-utils/mockIntersectionObserver'

describe('FolderCard', () => {
  it('renders a placeholder before the card intersects the viewport', () => {
    render(
      <FolderCard folder={{ name: 'Trip', path: 'C:\\Photos\\Trip', thumbnail: 'C:\\Photos\\Trip\\photo.jpg' }} />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('folder-card-placeholder')).toBeInTheDocument()
  })

  it('renders an image with the thumbnail path as src once the card intersects the viewport', () => {
    render(
      <FolderCard folder={{ name: 'Trip', path: 'C:\\Photos\\Trip', thumbnail: 'C:\\Photos\\Trip\\photo.jpg' }} />
    )

    const [observerInstance] = MockIntersectionObserver.instances
    act(() => triggerIntersection(observerInstance, true))

    const image = screen.getByRole('img', { name: 'Trip' })
    expect(image.getAttribute('src')).toBe(toThumbnailUrl('C:\\Photos\\Trip\\photo.jpg'))
  })

  it('renders a placeholder instead of an image when thumbnail is null, even after intersecting', () => {
    render(<FolderCard folder={{ name: 'Docs', path: 'C:\\Photos\\Docs', thumbnail: null }} />)

    const [observerInstance] = MockIntersectionObserver.instances
    act(() => triggerIntersection(observerInstance, true))

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('folder-card-placeholder')).toBeInTheDocument()
  })

  it('renders a muted inline video with the full-resolution src when the thumbnail is a video', () => {
    render(
      <FolderCard
        folder={{
          name: 'Clips',
          path: 'C:\\Photos\\Clips',
          thumbnail: 'C:\\Photos\\Clips\\clip.mp4',
          thumbnailIsVideo: true
        }}
      />
    )

    const [observerInstance] = MockIntersectionObserver.instances
    act(() => triggerIntersection(observerInstance, true))

    const video = screen.getByTestId('folder-card-video')
    expect(video.getAttribute('src')).toBe(toFileUrl('C:\\Photos\\Clips\\clip.mp4'))
  })

  it('plays the video on hover and pauses + resets the time to 0 when the hover ends', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})

    render(
      <FolderCard
        folder={{
          name: 'Clips',
          path: 'C:\\Photos\\Clips',
          thumbnail: 'C:\\Photos\\Clips\\clip.mp4',
          thumbnailIsVideo: true
        }}
      />
    )

    const [observerInstance] = MockIntersectionObserver.instances
    act(() => triggerIntersection(observerInstance, true))

    const video = screen.getByTestId('folder-card-video')
    const timeBadge = screen.getByTestId('folder-card-video-time')
    const media = video.closest('.folder-card-media')

    expect(timeBadge).toHaveTextContent('0:00')

    fireEvent.mouseEnter(media)
    expect(playSpy).toHaveBeenCalled()

    video.currentTime = 5
    fireEvent.timeUpdate(video)
    expect(timeBadge).toHaveTextContent('0:05')

    fireEvent.mouseLeave(media)
    expect(pauseSpy).toHaveBeenCalled()
    expect(video.currentTime).toBe(0)
    expect(timeBadge).toHaveTextContent('0:00')

    playSpy.mockRestore()
    pauseSpy.mockRestore()
  })
})
