import { useEffect } from 'react'

function GalleryModal({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + images.length) % images.length
        onNavigate(prevIndex)
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % images.length
        onNavigate(nextIndex)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lock body scrolling while modal is active
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentIndex, images.length, onClose, onNavigate])

  if (!isOpen || currentIndex === null || !images.length) {
    return null
  }

  const currentImage = images[currentIndex]
  if (!currentImage) return null

  const handlePrev = (e) => {
    e.stopPropagation()
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    onNavigate(prevIndex)
  }

  const handleNext = (e) => {
    e.stopPropagation()
    const nextIndex = (currentIndex + 1) % images.length
    onNavigate(nextIndex)
  }

  return (
    <div
      className="gallery-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview modal"
    >
      {/* Top Bar with Counter and Close Button */}
      <span className="gallery-modal-counter">
        {currentIndex + 1} / {images.length}
      </span>

      <button
        type="button"
        className="gallery-modal-close-btn"
        onClick={onClose}
        aria-label="Close image modal"
      >
        <svg
          className="gallery-modal-close-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Navigation Arrow: Previous */}
      <button
        type="button"
        className="gallery-modal-nav-btn gallery-modal-prev-btn"
        onClick={handlePrev}
        aria-label="Previous image"
      >
        <svg
          className="gallery-modal-arrow-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div
        className="gallery-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gallery-modal-image-wrapper">
          <img
            src={currentImage.imageUrl}
            alt={currentImage.alt || 'Full resort gallery photo'}
            className="gallery-modal-image"
          />
        </div>
      </div>

      {/* Navigation Arrow: Next */}
      <button
        type="button"
        className="gallery-modal-nav-btn gallery-modal-next-btn"
        onClick={handleNext}
        aria-label="Next image"
      >
        <svg
          className="gallery-modal-arrow-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

export default GalleryModal
