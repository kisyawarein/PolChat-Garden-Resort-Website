import { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import PackageRatesEditor from './components/PackageRatesEditor'
import GlobalChargesEditor from './components/GlobalChargesEditor'
import ResortPoliciesEditor from './components/ResortPoliciesEditor'
import './styles.css'

export default function PricesPolicies() {
  const [packages, setPackages] = useState(() => [
    {
      duration_id: 1,
      duration_name: 'Day Tour (9:00 AM - 5:00 PM)',
      duration_hours: 8,
      duration_price: 9000,
      duration_extra_pax_charge: 200,
      duration_extension_charge: 700,
      duration_event_rate: 1500,
      duration_start: '09:00:00',
      duration_end: '17:00:00',
      max_pax: 35,
      sec_dep: 2000,
    },
    {
      duration_id: 2,
      duration_name: 'Overnight (8:00 PM - 6:00 AM)',
      duration_hours: 10,
      duration_price: 10000,
      duration_extra_pax_charge: 200,
      duration_extension_charge: 800,
      duration_event_rate: 2000,
      duration_start: '20:00:00',
      duration_end: '06:00:00',
      max_pax: 25,
      sec_dep: 2000,
    },
    {
      duration_id: 3,
      duration_name: '22 Hours - Day Start (8:00 AM - 6:00 AM)',
      duration_hours: 22,
      duration_price: 17000,
      duration_extra_pax_charge: 200,
      duration_extension_charge: 700,
      duration_event_rate: 3000,
      duration_start: '08:00:00',
      duration_end: '06:00:00',
      max_pax: 35,
      sec_dep: 2000,
    },
    {
      duration_id: 4,
      duration_name: '22 Hours - Night Start (8:00 PM - 6:00 PM)',
      duration_hours: 22,
      duration_price: 17000,
      duration_extra_pax_charge: 200,
      duration_extension_charge: 800,
      duration_event_rate: 3000,
      duration_start: '20:00:00',
      duration_end: '18:00:00',
      max_pax: 35,
      sec_dep: 2000,
    },
  ])

  const [policies, setPolicies] = useState(() => ({
    security_deposit: 2000,
    downpayment_percentage: 50,
    cancellation_notice_days: 5,
    ocular_visit_fee: 0,
    extra_pax_policy_text: 'Maximum capacity strict policy applies. Additional guests above threshold are charged ₱200/head.',
    downpayment_policy_text: 'A minimum 50% reservation deposit is required to confirm date locks. Balance is payable upon check-in.',
    cancellation_policy_text: 'Rescheduling is permitted up to 5 days prior to arrival. Deposits are non-refundable for same-week cancellations.',
    gcash_number: '0953 495 4389',
    gcash_name: 'PolChat Garden Resort Admin',
  }))

  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('packages') // 'packages' | 'global' | 'policies'

  useEffect(() => {
    async function loadData() {
      const [pkgs, pols] = await Promise.all([
        DataService.getDurationTypes(),
        DataService.getResortPolicies(),
      ])
      if (pkgs && pkgs.length > 0) setPackages(pkgs)
      if (pols) setPolicies(pols)
    }
    loadData()
  }, [])

  const handleSavePackage = async (durationId, updates) => {
    setIsSaving(true)
    // 1. Optimistic local state update (zero stutter)
    setPackages((prev) =>
      prev.map((p) => (p.duration_id === durationId ? { ...p, ...updates } : p))
    )

    // 2. Persist to Supabase in the background
    DataService.updateDurationType(durationId, updates).finally(() => {
      setIsSaving(false)
    })
    return true
  }

  const handleSavePolicies = async (updates) => {
    setIsSaving(true)
    // 1. Optimistic local state update
    setPolicies((prev) => ({ ...prev, ...updates }))

    // 2. If security_deposit was updated, also update all packages in local state optimistically!
    if (updates.security_deposit !== undefined) {
      setPackages((prev) =>
        prev.map((p) => ({ ...p, sec_dep: Number(updates.security_deposit) }))
      )
    }

    DataService.updateResortPolicies(updates).finally(() => {
      setIsSaving(false)
    })
    return true
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Package Base Rates</span>
          </button>
          <button
            type="button"
            className={`pp-tab-btn ${activeTab === 'global' ? 'pp-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>Global Fees & Payment</span>
          </button>
          <button
            type="button"
            className={`pp-tab-btn ${activeTab === 'policies' ? 'pp-tab-btn-active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Rules & Terms</span>
          </button>
        </div>
      </div>

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
    </div>
  )
}
