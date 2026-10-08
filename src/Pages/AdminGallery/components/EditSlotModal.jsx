import { useState, useRef } from 'react'
import { DataService } from '../../../services/dataService'
import galleryDefaultImg from '../../../../resources/Gallery_Image.jpg'

function EditSlotModal({
  slot,
  isOpen,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(slot?.title || '')
  const [category, setCategory] = useState(slot?.category || 'Resort Highlights')
  const [caption, setCaption] = useState(slot?.caption || '')
  const [previewUrl, setPreviewUrl] = useState(slot?.image_url || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef(null)

  if (!isOpen || !slot) return null

  const categories = [
    'Resort Highlights',
    'Event Gatherings',
    'Scenic Grounds',
    'Cozy Corners',
    'Lush Botanicals',
  ]

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).')
      return
    }

    setIsProcessing(true)
    setErrorMsg('')

    try {
      // Compress and convert to URL / base64
      const compressedBlob = await DataService.compressImage(file, 1600, 0.8)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
        setIsProcessing(false)
      }
      reader.onerror = () => {
        setErrorMsg('Failed to process image file.')
        setIsProcessing(false)
      }
      reader.readAsDataURL(compressedBlob)
    } catch (err) {
      console.error('File compression error:', err)
      setErrorMsg('Could not process image. Please try another file.')
      setIsProcessing(false)
    }
  }

  const handleUsePresetImage = () => {
    setPreviewUrl(galleryDefaultImg)
    setErrorMsg('')
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('Please provide a title for this gallery slot.')
      return
    }

    onSave(slot.slot_id, {
      title: title.trim(),
      category,
      caption: caption.trim(),
      image_url: previewUrl,
    })
    onClose()
  }

  return (
    <div className="adm-gal-modal-overlay">
      <div className="adm-gal-modal-backdrop" onClick={onClose} />
      <div className="adm-gal-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="adm-gal-modal-header">
          <div>
            <span className="adm-gal-modal-badge">{slot.label}</span>
            <h2 className="adm-gal-modal-title">Edit Gallery Container Slot</h2>
          </div>
          <button
            type="button"
            className="adm-gal-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="adm-gal-modal-alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="adm-gal-modal-form">
          {/* Top: Image Uploader / Dropzone */}
          <div className="adm-gal-form-group">
            <label className="adm-gal-form-label">
              Upload Photo <span className="adm-gal-req">*</span>
            </label>

            <div className="adm-gal-upload-dropzone">
              {previewUrl ? (
                <div className="adm-gal-active-preview-wrap">
                  <img
                    src={previewUrl}
                    alt="Slot Preview"
                    className="adm-gal-active-preview-img"
                  />
                  <div className="adm-gal-preview-btn-row">
                    <button
                      type="button"
                      className="adm-gal-change-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📁 Change File
                    </button>
                    <button
                      type="button"
                      className="adm-gal-clear-photo-btn"
                      onClick={handleClearImage}
                    >
                      ✕ Clear Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="adm-gal-dropzone-empty"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="adm-gal-dropzone-icon">☁️</span>
                  <strong className="adm-gal-dropzone-title">
                    {isProcessing ? 'Processing Image...' : 'Click to Upload or Drag & Drop'}
                  </strong>
                  <span className="adm-gal-dropzone-hint">
                    Supports high-resolution JPG, PNG, WEBP (Auto-optimized)
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="adm-gal-hidden-file-input"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Presets Bar */}
            <div className="adm-gal-presets-row">
              <span className="adm-gal-preset-label">Quick Actions:</span>
              <button
                type="button"
                className="adm-gal-preset-btn"
                onClick={handleUsePresetImage}
              >
                🌄 Use Default Resort Panorama
              </button>
            </div>
          </div>

          {/* Form Fields: Title & Category */}
          <div className="adm-gal-fields-grid">
            <div className="adm-gal-form-group">
              <label className="adm-gal-form-label" htmlFor="slotTitle">
                Photo Title <span className="adm-gal-req">*</span>
              </label>
              <input
                id="slotTitle"
                type="text"
                className="adm-gal-input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Resort Grounds"
                required
              />
            </div>

            <div className="adm-gal-form-group">
              <label className="adm-gal-form-label" htmlFor="slotCategory">
                Category
              </label>
              <select
                id="slotCategory"
                className="adm-gal-select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Caption */}
          <div className="adm-gal-form-group">
            <label className="adm-gal-form-label" htmlFor="slotCaption">
              Photo Description / Caption
            </label>
            <textarea
              id="slotCaption"
              rows={2}
              className="adm-gal-textarea-field"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short description of this photo spot..."
            />
          </div>

          {/* Modal Actions */}
          <div className="adm-gal-modal-actions">
            <button
              type="button"
              className="adm-gal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-gal-btn-save"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Save Gallery Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSlotModal
