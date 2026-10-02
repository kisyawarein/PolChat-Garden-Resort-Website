import { supabase } from './supabase'

// Fallback seed data in case Supabase tables are fresh or loading
const INITIAL_CUSTOMERS = [
  {
    customer_id: 101,
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    phone_number: 9171234567,
    date_create: '2026-01-15',
    date_modified: '2026-03-01',
    email: 'juan.delacruz@gmail.com',
  },
  {
    customer_id: 102,
    first_name: 'Maria',
    last_name: 'Santos',
    phone_number: 9289876543,
    date_create: '2026-02-10',
    date_modified: '2026-03-12',
    email: 'maria.santos@yahoo.com',
  },
  {
    customer_id: 103,
    first_name: 'Carlos',
    last_name: 'Reyes',
    phone_number: 9355551234,
    date_create: '2026-02-28',
    date_modified: '2026-03-18',
    email: 'carlos.reyes@outlook.com',
  },
  {
    customer_id: 104,
    first_name: 'Elena',
    last_name: 'Bautista',
    phone_number: 9491112233,
    date_create: '2026-03-05',
    date_modified: '2026-03-20',
    email: 'elena.bautista@gmail.com',
  },
]

const INITIAL_DURATION_TYPES = [
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
    duration_name: '22 Hours (8:00 AM - 6:00 AM)',
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
    duration_name: '22 Hours (8:00 PM - 6:00 PM)',
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
]

const INITIAL_RESERVATIONS = [
  {
    reservation_id: 1001,
    customer_id: 101,
    guest_count: 28,
    duration_id: 1,
    start_date: '2026-10-05T09:00:00',
    end_date: '2026-10-05T17:00:00',
    extension_duration: null,
    has_paid_sec_dep: true,
    has_paid_reservation: true,
    reservation_cost: 9000,
    extra_charges: 0,
    reservation_status: 'confirmed',
    event_name: 'Dela Cruz Family Reunion',
    payment_method: 'GCash',
    payment_reference: 'GCASH-98234710',
    customer_name: 'Juan Dela Cruz',
    customer_phone: '09171234567',
  },
  {
    reservation_id: 1002,
    customer_id: 102,
    guest_count: 22,
    duration_id: 2,
    start_date: '2026-10-07T20:00:00',
    end_date: '2026-10-08T06:00:00',
    extension_duration: null,
    has_paid_sec_dep: true,
    has_paid_reservation: false,
    reservation_cost: 10000,
    extra_charges: 0,
    reservation_status: 'pending',
    event_name: 'Maria 25th Birthday Bash',
    payment_method: 'GCash',
    payment_reference: 'GCASH-77182903',
    customer_name: 'Maria Santos',
    customer_phone: '09289876543',
  },
  {
    reservation_id: 1003,
    customer_id: 103,
    guest_count: 32,
    duration_id: 3,
    start_date: '2026-10-12T08:00:00',
    end_date: '2026-10-13T06:00:00',
    extension_duration: null,
    has_paid_sec_dep: true,
    has_paid_reservation: true,
    reservation_cost: 17000,
    extra_charges: 1400,
    reservation_status: 'confirmed',
    event_name: 'Tech Horizon Team Building',
    payment_method: 'Bank Transfer',
    payment_reference: 'BDO-00918234',
    customer_name: 'Carlos Reyes',
    customer_phone: '09355551234',
  },
  {
    reservation_id: 1004,
    customer_id: 104,
    guest_count: 15,
    duration_id: 1,
    start_date: '2026-10-18T09:00:00',
    end_date: '2026-10-18T17:00:00',
    extension_duration: null,
    has_paid_sec_dep: false,
    has_paid_reservation: false,
    reservation_cost: 9000,
    extra_charges: 0,
    reservation_status: 'cancelled',
    event_name: 'Elena Weekend Chill',
    payment_method: 'GCash',
    payment_reference: null,
    customer_name: 'Elena Bautista',
    customer_phone: '09491112233',
  },
]

const INITIAL_VISITATIONS = [
  {
    visitation_id: 501,
    customer_id: 102,
    guest_count: 2,
    visitation_start_date: '2026-10-04T09:00:00',
    visitation_end_date: '2026-10-04T11:00:00',
    visitation_status: 'confirmed',
    slot_type: 'Morning (9:00 AM - 11:00 AM)',
    customer_name: 'Maria Santos',
    customer_phone: '09289876543',
    purpose: 'Wedding venue inspection',
  },
  {
    visitation_id: 502,
    customer_id: 104,
    guest_count: 3,
    visitation_start_date: '2026-10-09T14:00:00',
    visitation_end_date: '2026-10-09T16:00:00',
    visitation_status: 'pending',
    slot_type: 'Afternoon (2:00 PM - 4:00 PM)',
    customer_name: 'Elena Bautista',
    customer_phone: '09491112233',
    purpose: 'Family celebration preview',
  },
]

const INITIAL_INQUIRIES = [
  {
    inquiry_id: 301,
    inquiry_label: 'Catering & Extra Pax Inquiry',
    customer_id: 101,
    customer_name: 'Juan Dela Cruz',
    inquiry_status: 'in-progress',
    created_at: '2026-10-01T10:15:00',
    updated_at: '2026-10-01T11:30:00',
    admin_responder: 'Admin Sarah',
  },
  {
    inquiry_id: 302,
    inquiry_label: 'GCash Payment Verification',
    customer_id: 102,
    customer_name: 'Maria Santos',
    inquiry_status: 'open',
    created_at: '2026-10-02T14:20:00',
    updated_at: '2026-10-02T14:20:00',
    admin_responder: null,
  },
]

const INITIAL_CHATS = [
  {
    chat_id: 1,
    inquiry_id: 301,
    sender: 'customer',
    sender_name: 'Juan Dela Cruz',
    message: 'Hello! Can we bring an outside catering setup for 40 guests for the day tour?',
    sent_at: '2026-10-01T10:15:00',
  },
  {
    chat_id: 2,
    inquiry_id: 301,
    sender: 'admin',
    sender_name: 'Admin Sarah',
    message: 'Hi Juan! Yes, outside catering is allowed with no corkage fee. For 40 guests, there is an extra pax fee of PHP 200 per head exceeding 35 pax.',
    sent_at: '2026-10-01T11:30:00',
  },
  {
    chat_id: 3,
    inquiry_id: 302,
    sender: 'customer',
    sender_name: 'Maria Santos',
    message: 'Good day! I have sent the 2k security deposit via GCash ref #77182903. Can you verify receipt?',
    sent_at: '2026-10-02T14:20:00',
  },
]

const INITIAL_REVIEWS = [
  {
    review_id: 1,
    customer_id: 101,
    customer_name: 'Juan Dela Cruz',
    review_stars: 5,
    review_comment: 'Super spacious and clean resort! The pool and garden view were breathtaking for our family reunion. Will definitely book again!',
    date_submitted: '2026-09-20T16:00:00',
  },
  {
    review_id: 2,
    customer_id: 103,
    customer_name: 'Carlos Reyes',
    review_stars: 5,
    review_comment: 'Our team building was a huge success. Staff were accommodating and amenities are top tier. Highly recommended!',
    date_submitted: '2026-09-25T11:45:00',
  },
]

// Storage helpers
function getLocalData(key, fallback) {
  try {
    const saved = localStorage.getItem(`polchat_${key}`)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(`polchat_${key}`, JSON.stringify(data))
  } catch (err) {
    console.error('Storage error:', err)
  }
}

export const DataService = {
  // Customers
  async getCustomers() {
    try {
      const { data, error } = await supabase.from('customer_accounts').select('*')
      if (!error && data && data.length > 0) {
        setLocalData('customers', data)
        return data
      }
    } catch {
      // ignore
    }
    return getLocalData('customers', INITIAL_CUSTOMERS)
  },

  async addCustomer(customer) {
    const local = getLocalData('customers', INITIAL_CUSTOMERS)
    const newCustomer = {
      customer_id: customer.customer_id || Date.now(),
      first_name: customer.first_name,
      last_name: customer.last_name || '',
      phone_number: customer.phone_number || '',
      email: customer.email || '',
      date_create: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0],
    }
    const updated = [newCustomer, ...local]
    setLocalData('customers', updated)

    try {
      await supabase.from('customer_accounts').insert([newCustomer])
    } catch {
      // offline fallback
    }
    return newCustomer
  },

  // Duration Types
  async getDurationTypes() {
    try {
      const { data, error } = await supabase.from('duration_types').select('*')
      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // ignore
    }
    return INITIAL_DURATION_TYPES
  },

  // Reservations
  async getReservations() {
    try {
      const { data, error } = await supabase.from('resort_reservations').select('*')
      if (!error && data && data.length > 0) {
        setLocalData('reservations', data)
        return data
      }
    } catch {
      // ignore
    }
    return getLocalData('reservations', INITIAL_RESERVATIONS)
  },

  async updateReservationStatus(reservationId, newStatus) {
    const local = getLocalData('reservations', INITIAL_RESERVATIONS)
    const updated = local.map((r) =>
      r.reservation_id === reservationId ? { ...r, reservation_status: newStatus } : r
    )
    setLocalData('reservations', updated)

    try {
      await supabase
        .from('resort_reservations')
        .update({ reservation_status: newStatus })
        .eq('reservation_id', reservationId)
    } catch {
      // ignore
    }
    return updated
  },

  async updateReservationPayment(reservationId, updates) {
    const local = getLocalData('reservations', INITIAL_RESERVATIONS)
    const updated = local.map((r) =>
      r.reservation_id === reservationId ? { ...r, ...updates } : r
    )
    setLocalData('reservations', updated)

    try {
      await supabase
        .from('resort_reservations')
        .update(updates)
        .eq('reservation_id', reservationId)
    } catch {
      // ignore
    }
    return updated
  },

  // Visitations
  async getVisitations() {
    try {
      const { data, error } = await supabase.from('resort_visitations').select('*')
      if (!error && data && data.length > 0) {
        setLocalData('visitations', data)
        return data
      }
    } catch {
      // ignore
    }
    return getLocalData('visitations', INITIAL_VISITATIONS)
  },

  async updateVisitationStatus(visitationId, newStatus) {
    const local = getLocalData('visitations', INITIAL_VISITATIONS)
    const updated = local.map((v) =>
      v.visitation_id === visitationId ? { ...v, visitation_status: newStatus } : v
    )
    setLocalData('visitations', updated)

    try {
      await supabase
        .from('resort_visitations')
        .update({ visitation_status: newStatus })
        .eq('visitation_id', visitationId)
    } catch {
      // ignore
    }
    return updated
  },

  // Inquiries
  async getInquiries() {
    try {
      const { data, error } = await supabase.from('resort_inquiries').select('*')
      if (!error && data && data.length > 0) {
        setLocalData('inquiries', data)
        return data
      }
    } catch {
      // ignore
    }
    return getLocalData('inquiries', INITIAL_INQUIRIES)
  },

  async createInquiry({ label, message, customerId, customerName }) {
    const localInquiries = getLocalData('inquiries', INITIAL_INQUIRIES)
    const localChats = getLocalData('chats', INITIAL_CHATS)

    const newInquiryId = Date.now()
    const nowIso = new Date().toISOString()

    const newInquiry = {
      inquiry_id: newInquiryId,
      inquiry_label: label,
      customer_id: customerId || 101,
      customer_name: customerName || 'Guest User',
      inquiry_status: 'open',
      created_at: nowIso,
      updated_at: nowIso,
      admin_responder: null,
    }

    const firstChat = {
      chat_id: Date.now() + 1,
      inquiry_id: newInquiryId,
      sender: 'customer',
      sender_name: customerName || 'Guest User',
      message: message,
      sent_at: nowIso,
    }

    const updatedInquiries = [newInquiry, ...localInquiries]
    const updatedChats = [...localChats, firstChat]

    setLocalData('inquiries', updatedInquiries)
    setLocalData('chats', updatedChats)

    try {
      await supabase.from('resort_inquiries').insert([
        {
          inquiry_id: newInquiryId,
          inquiry_label: label,
          customer_id: customerId,
          inquiry_status: 'open',
          created_at: nowIso,
          updated_at: nowIso,
        },
      ])
      await supabase.from('inquiry_chats').insert([
        {
          chat_id: firstChat.chat_id,
          inquiry_id: newInquiryId,
          sender: 'customer',
          message: message,
          sent_at: nowIso,
        },
      ])
    } catch {
      // ignore
    }

    return { newInquiry, firstChat }
  },

  async assignAdminResponder(inquiryId, adminName) {
    const local = getLocalData('inquiries', INITIAL_INQUIRIES)
    const updated = local.map((inq) =>
      inq.inquiry_id === inquiryId
        ? {
            ...inq,
            admin_responder: adminName,
            inquiry_status: inq.inquiry_status === 'open' ? 'in-progress' : inq.inquiry_status,
            updated_at: new Date().toISOString(),
          }
        : inq
    )
    setLocalData('inquiries', updated)

    try {
      await supabase
        .from('resort_inquiries')
        .update({
          admin_responder: adminName,
          inquiry_status: 'in-progress',
          updated_at: new Date().toISOString(),
        })
        .eq('inquiry_id', inquiryId)
    } catch {
      // ignore
    }
    return updated
  },

  async updateInquiryStatus(inquiryId, status) {
    const local = getLocalData('inquiries', INITIAL_INQUIRIES)
    const updated = local.map((inq) =>
      inq.inquiry_id === inquiryId
        ? { ...inq, inquiry_status: status, updated_at: new Date().toISOString() }
        : inq
    )
    setLocalData('inquiries', updated)

    try {
      await supabase
        .from('resort_inquiries')
        .update({ inquiry_status: status, updated_at: new Date().toISOString() })
        .eq('inquiry_id', inquiryId)
    } catch {
      // ignore
    }
    return updated
  },

  // Chats
  async getChats(inquiryId) {
    const localChats = getLocalData('chats', INITIAL_CHATS)
    try {
      const { data, error } = await supabase
        .from('inquiry_chats')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('sent_at', { ascending: true })
      if (!error && data && data.length > 0) {
        return data
      }
    } catch {
      // ignore
    }
    return localChats.filter((c) => c.inquiry_id === Number(inquiryId))
  },

  async sendChatMessage({ inquiryId, sender, senderName, message }) {
    const localChats = getLocalData('chats', INITIAL_CHATS)
    const newChat = {
      chat_id: Date.now(),
      inquiry_id: Number(inquiryId),
      sender: sender,
      sender_name: senderName || (sender === 'admin' ? 'Admin' : 'Customer'),
      message: message,
      sent_at: new Date().toISOString(),
    }
    const updated = [...localChats, newChat]
    setLocalData('chats', updated)

    try {
      await supabase.from('inquiry_chats').insert([
        {
          chat_id: newChat.chat_id,
          inquiry_id: Number(inquiryId),
          sender: sender,
          message: message,
          sent_at: newChat.sent_at,
        },
      ])
    } catch {
      // ignore
    }
    return newChat
  },

  // Reviews
  async getReviews() {
    try {
      const { data, error } = await supabase.from('customer_reviews').select('*')
      if (!error && data && data.length > 0) {
        setLocalData('reviews', data)
        return data
      }
    } catch {
      // ignore
    }
    return getLocalData('reviews', INITIAL_REVIEWS)
  },

  async addReview({ customerId, customerName, stars, comment }) {
    const local = getLocalData('reviews', INITIAL_REVIEWS)
    const newReview = {
      review_id: Date.now(),
      customer_id: customerId || 101,
      customer_name: customerName || 'Juan Dela Cruz',
      review_stars: stars,
      review_comment: comment,
      date_submitted: new Date().toISOString(),
    }
    const updated = [newReview, ...local]
    setLocalData('reviews', updated)

    try {
      await supabase.from('customer_reviews').insert([
        {
          review_id: newReview.review_id,
          customer_id: customerId || 101,
          review_stars: stars,
          review_comment: comment,
          date_submitted: newReview.date_submitted,
        },
      ])
    } catch {
      // ignore
    }
    return newReview
  },

  // Export to CSV helper
  exportToCsv(filename, rows) {
    if (!rows || !rows.length) return
    const separator = ','
    const keys = Object.keys(rows[0])
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k]
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""')
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`
              }
              return cell
            })
            .join(separator)
        )
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
