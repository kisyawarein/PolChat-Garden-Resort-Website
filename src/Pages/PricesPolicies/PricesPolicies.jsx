import { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import PackageRatesEditor from './components/PackageRatesEditor'
import GlobalChargesEditor from './components/GlobalChargesEditor'
import ResortPoliciesEditor from './components/ResortPoliciesEditor'
import './styles.css'

export default function PricesPolicies() {
  const [packages, setPackages] = useState([])
  const [policies, setPolicies] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('packages') // 'packages' | 'global' | 'policies'

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [pkgs, pols] = await Promise.all([
        DataService.getDurationTypes(),
        DataService.getResortPolicies(),
      ])
      setPackages(pkgs || [])
      setPolicies(pols || {})
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSavePackage = async (durationId, updates) => {
    setIsSaving(true)
    // 1. Optimistic local state update (zero stutter)
    setPackages((prev) =>
      prev.map((p) => (p.duration_id === durationId ? { ...p, ...updates } : p))
    )

    // 2. Persist to Supabase
    const res = await DataService.updateDurationType(durationId, updates)
    setIsSaving(false)
    return !!res
  }

  const handleSavePolicies = async (updates) => {
    setIsSaving(true)
    // Optimistic local state update
    setPolicies((prev) => ({ ...prev, ...updates }))

    const res = await DataService.updateResortPolicies(updates)
    setIsSaving(false)
    return !!res
  }

  return (
    <div className="pp-page-wrapper">
      {/* Page Title & Navigation Header */}
      <div className="pp-top-header">
        <div className="pp-title-stack">
          <span className="pp-badge-tag">ADMIN CONFIGURATION</span>
          <h1 className="pp-main-heading">Prices & Resort Policies</h1>
          <p className="pp-main-subtext">
            Centralized rate management for Day Tour, Overnight, and 22-Hour packages. All price adjustments sync directly with Supabase for future bookings while strictly preserving historical transaction logs.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="pp-tabs-bar">
          <button
            type="button"
            className={`pp-tab-btn ${activeTab === 'packages' ? 'pp-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            📦 Package Base Rates
          </button>
          <button
            type="button"
            className={`pp-tab-btn ${activeTab === 'global' ? 'pp-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            💳 Global Fees & Payment
          </button>
          <button
            type="button"
            className={`pp-tab-btn ${activeTab === 'policies' ? 'pp-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            📜 Rules & Terms
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="pp-loading-state">
          <div className="pp-spinner" />
          <span>Loading resort rate configurations...</span>
        </div>
      ) : (
        <div className="pp-content-body">
          {activeTab === 'packages' && (
            <PackageRatesEditor
              packages={packages}
              onSavePackage={handleSavePackage}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'global' && (
            <GlobalChargesEditor
              policies={policies}
              onSavePolicies={handleSavePolicies}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'policies' && (
            <ResortPoliciesEditor
              policies={policies}
              onSavePolicies={handleSavePolicies}
              isSaving={isSaving}
            />
          )}
        </div>
      )}
    </div>
  )
}
