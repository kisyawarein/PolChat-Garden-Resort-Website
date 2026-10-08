import { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import GalleryStatsHeader from './components/GalleryStatsHeader'
import GallerySlotCard from './components/GallerySlotCard'
import EditSlotModal from './components/EditSlotModal'
import CustomerPreviewModal from './components/CustomerPreviewModal'
import './styles.css'

function AdminGallery() {
  const [galleryItems, setGalleryItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [editingSlot, setEditingSlot] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    async function loadGallery() {
      const items = await DataService.getGalleryItems()
      setGalleryItems(items || [])
    }
    loadGallery()

    const handleUpdated = (e) => {
      if (e.detail) setGalleryItems(e.detail)
    }
    window.addEventListener('polchat_gallery_updated', handleUpdated)
    return () => window.removeEventListener('polchat_gallery_updated', handleUpdated)
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleEditSlot = (slot) => {
    setEditingSlot(slot)
  }

  const handleSaveSlot = async (slotId, updates) => {
    // Optimistic UI update
    setGalleryItems((prev) =>
      prev.map((item) =>
        Number(item.slot_id) === Number(slotId)
          ? { ...item, ...updates, last_updated: new Date().toISOString() }
          : item
      )
    )
    showToast(`Slot ${slotId} updated successfully!`)

    await DataService.updateGalleryItem(slotId, updates)
  }

  const handleRemovePhoto = async (slotId) => {
    setGalleryItems((prev) =>
      prev.map((item) =>
        Number(item.slot_id) === Number(slotId)
          ? { ...item, image_url: null, last_updated: new Date().toISOString() }
          : item
      )
    )
    showToast(`Photo removed from Slot ${slotId}. Restored default theme card.`)

    await DataService.updateGalleryItem(slotId, { image_url: null })
  }

  const handleResetAll = async () => {
    if (window.confirm('Are you sure you want to reset all 13 gallery slots to initial defaults?')) {
      const defaults = await DataService.resetAllGalleryItems()
      setGalleryItems(defaults || [])
      showToast('All 13 gallery slots have been reset to defaults.')
    }
  }

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory)

  return (
    <div className="admin-gallery-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="adm-gal-toast">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      <div className="admin-gallery-container">
        {/* Stats & Controls Header */}
        <GalleryStatsHeader
          galleryItems={galleryItems}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onResetAll={handleResetAll}
          onOpenPreview={() => setIsPreviewOpen(true)}
        />

        {/* Gallery Slots Grid */}
        <div className="adm-gal-grid-section">
          <div className="adm-gal-grid-header">
            <h2 className="adm-gal-grid-title">
              Gallery Slots ({filteredItems.length} of {galleryItems.length} Containers)
            </h2>
            <span className="adm-gal-capacity-notice">
              🔒 Fixed Container Capacity: 13 Featured Photos Maximum
            </span>
          </div>

          <div className="adm-gal-cards-grid">
            {filteredItems.map((slot) => (
              <GallerySlotCard
                key={slot.slot_id}
                slot={slot}
                onEdit={handleEditSlot}
                onRemovePhoto={handleRemovePhoto}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          isOpen={Boolean(editingSlot)}
          onClose={() => setEditingSlot(null)}
          onSave={handleSaveSlot}
        />
      )}

      {/* Live Customer Preview Modal */}
      <CustomerPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        galleryItems={galleryItems}
      />
    </div>
  )
}

export default AdminGallery
