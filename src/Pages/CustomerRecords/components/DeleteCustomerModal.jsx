import React from 'react'

function DeleteCustomerModal({ isOpen, onClose, onConfirm, customer, isDeleteAll = false, count = 0 }) {
  if (!isOpen) return null

  return (
    <div className="cust-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cust-delete-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cust-delete-modal-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 className="cust-delete-modal-title">
          {isDeleteAll ? 'Delete All Customer Accounts?' : 'Delete Customer Account?'}
        </h3>

        <p className="cust-delete-modal-desc">
          {isDeleteAll ? (
            <>
              This will permanently delete all <strong>{count} customer accounts</strong> and their registered records from Supabase. This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete the account for <strong>{customer?.first_name} {customer?.last_name || ''}</strong>?
            </>
          )}
        </p>

        <div className="cust-delete-modal-actions">
          <button
            type="button"
            className="cust-delete-modal-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cust-delete-modal-confirm-btn"
            onClick={onConfirm}
          >
            {isDeleteAll ? 'Yes, Delete All' : 'Yes, Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteCustomerModal
