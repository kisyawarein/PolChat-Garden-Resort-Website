import { supabase } from './supabase'
import { EmailService } from './emailService'

const _adminCache = {
  reservations: null,
  visitations: null,
  customers: null,
  inquiries: null,
  reviews: null,
  durationTypes: null,
}

export const DataService = {
  invalidateCache(key = null) {
    if (key && key in _adminCache) {
      _adminCache[key] = null
    } else {
      Object.keys(_adminCache).forEach((k) => {
        _adminCache[k] = null
      })
    }
  },

  async preloadAdminData() {
    try {
      await Promise.all([
        this.getReservations({ force: true }),
        this.getVisitations({ force: true }),
        this.getCustomers({ force: true }),
        this.getInquiries({ force: true }),
        this.getReviews({ force: true }),
        this.getDurationTypes({ force: true }),
      ])
    } catch (e) {
      console.warn('Preload admin data note:', e)
    }
  },

  // Helper: Ensure customer exists in customer_accounts table
  async ensureCustomer({ customerId, customerName, phone = 9171234567 }) {
    try {
      if (customerId) {
        const { data: existing } = await supabase
          .from('customer_accounts')
          .select('customer_id')
          .eq('customer_id', customerId)
          .maybeSingle()

        if (existing) {
          return existing.customer_id
        }
      }

      // Check by name or create a new customer
      const nameParts = (customerName || 'Customer Account').trim().split(' ')
      const firstName = nameParts[0] || 'Customer'
      const lastName = nameParts.slice(1).join(' ') || ''

      const { data: matchByName } = await supabase
        .from('customer_accounts')
        .select('customer_id')
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .limit(1)

      if (matchByName && matchByName.length > 0) {
        return matchByName[0].customer_id
      }

      // Insert new customer into customer_accounts
      const { data: inserted, error } = await supabase
        .from('customer_accounts')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            phone_number: Number(phone) || 9171234567,
            date_create: new Date().toISOString().split('T')[0],
            date_modified: new Date().toISOString().split('T')[0],
          },
        ])
        .select()

      if (!error && inserted && inserted.length > 0) {
        return inserted[0].customer_id
      }

      if (customerId) return customerId
    } catch (err) {
      console.error('Error ensuring customer:', err)
    }
    return customerId || 1
  },

  // ==========================================
  // 1. CUSTOMER ACCOUNTS
  // ==========================================
  async getCustomers(opts = {}) {
    if (!opts.force && _adminCache.customers) {
      return _adminCache.customers
    }
    try {
      const { data, error } = await supabase
        .from('customer_accounts')
        .select('*')
        .order('customer_id', { ascending: false })

      if (error) {
        console.error('Error fetching customer_accounts:', error)
        return _adminCache.customers || []
      }

      const mapped = (data || []).map((c) => {
        let cleanLast = c.last_name || ''
        let extractedEmail = c.email || null
        let extractedPassword = c.password || null

        if (cleanLast.includes('__AUTH__') || cleanLast.includes('__PW__')) {
          const matchEmail = cleanLast.match(/__AUTH__(.*?)__(?:PW|$)/)
          if (matchEmail && matchEmail[1]) {
            extractedEmail = matchEmail[1].trim()
          }
          const matchPw = cleanLast.match(/__PW__(.*?)$/)
          if (matchPw && matchPw[1]) {
            extractedPassword = matchPw[1].trim()
          }
          cleanLast = cleanLast.split(' __AUTH__')[0].split(' __PW__')[0].trim()
        }

        return {
          ...c,
          first_name: c.first_name,
          last_name: cleanLast,
          email: extractedEmail || c.email || '',
          password: extractedPassword || c.password || null,
        }
      })

      _adminCache.customers = mapped
      return _adminCache.customers
    } catch (err) {
      console.error('Customer fetch exception:', err)
      return _adminCache.customers || []
    }
  },

  async addCustomer(customer) {
    const rawLast = (customer.last_name || '').trim()
    const email = (customer.email || '').trim()
    const password = (customer.password || '').trim()

    let fullLastWithMeta = rawLast
    if (email || password) {
      fullLastWithMeta = `${rawLast} __AUTH__${email}__PW__${password}`.trim()
    }

    const baseCustomer = {
      first_name: customer.first_name,
      last_name: fullLastWithMeta,
      phone_number: customer.phone_number ? Number(customer.phone_number) : 9171234567,
      date_create: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0],
    }

    try {
      // 1. Try inserting with direct email/password columns if available
      const fullPayload = {
        ...baseCustomer,
        last_name: rawLast,
        email: email || null,
        password: password || null,
      }

      let { data, error } = await supabase
        .from('customer_accounts')
        .insert([fullPayload])
        .select()

      // 2. Fallback: If table doesn't have email/password columns, insert with encoded metadata in last_name
      if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column'))) {
        const retryRes = await supabase
          .from('customer_accounts')
          .insert([baseCustomer])
          .select()
        data = retryRes.data
        error = retryRes.error
      }

      if (error) {
        console.error('Error inserting customer:', error)
      }

      const created = data?.[0] || {
        ...baseCustomer,
        customer_id: Date.now(),
      }

      this.invalidateCache('customers')
      return {
        ...created,
        first_name: customer.first_name,
        last_name: rawLast,
        email: email,
        password: password,
      }
    } catch (err) {
      console.error('Customer insert exception:', err)
      return null
    }
  },

  // ==========================================
  // 2. DURATION TYPES (RESORT PACKAGES & CHARGES)
  // ==========================================
  async getDurationTypes() {
    let localOverrides = {}
    try {
      const cached = localStorage.getItem('polchat_duration_types')
      if (cached) {
        const parsed = JSON.parse(cached)
        parsed.forEach((p) => {
          if (p && p.duration_id) {
            localOverrides[p.duration_id] = p
          }
        })
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from('duration_types')
        .select('*')
        .order('duration_id', { ascending: true })

      if (!error && data && data.length > 0) {
        const merged = data.map((d) => {
          const cachedPkg = localOverrides[d.duration_id] || {}
          return {
            ...d,
            max_pax: d.max_pax !== undefined && d.max_pax !== null ? Number(d.max_pax) : (cachedPkg.max_pax !== undefined ? Number(cachedPkg.max_pax) : 0),
            sec_dep: d.sec_dep !== undefined && d.sec_dep !== null ? Number(d.sec_dep) : (cachedPkg.sec_dep !== undefined ? Number(cachedPkg.sec_dep) : 2000),
          }
        })
        localStorage.setItem('polchat_duration_types', JSON.stringify(merged))
        return merged
      }
    } catch (err) {
      console.error('Duration types fetch exception:', err)
    }

    try {
      const cached = localStorage.getItem('polchat_duration_types')
      if (cached) return JSON.parse(cached)
    } catch (e) {}

    return [
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
    ]
  },

  async updateDurationType(durationId, updates) {
    try {
      // 1. Optimistic update to Supabase
      const { data, error } = await supabase
        .from('duration_types')
        .update(updates)
        .eq('duration_id', Number(durationId))
        .select()

      if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column'))) {
        const standardUpdates = { ...updates }
        delete standardUpdates.max_pax
        delete standardUpdates.sec_dep
        await supabase
          .from('duration_types')
          .update(standardUpdates)
          .eq('duration_id', Number(durationId))
      }

      // 2. Cache updated packages locally for instant smooth sync
      const current = await this.getDurationTypes()
      const updatedList = current.map((p) =>
        p.duration_id === Number(durationId) ? { ...p, ...updates } : p
      )
      localStorage.setItem('polchat_duration_types', JSON.stringify(updatedList))
      return data?.[0] || { duration_id: Number(durationId), ...updates }
    } catch (err) {
      console.error('Update duration type exception:', err)
      return null
    }
  },

  async getResortPolicies() {
    const defaultPolicies = {
      security_deposit: 2000,
      downpayment_percentage: 50,
      cancellation_notice_days: 5,
      ocular_visit_fee: 0,
      extra_pax_policy_text: 'Maximum capacity strict policy applies. Additional guests above threshold are charged ₱200/head.',
      downpayment_policy_text: 'A minimum 50% reservation deposit is required to confirm date locks. Balance is payable upon check-in.',
      cancellation_policy_text: 'Rescheduling is permitted up to 5 days prior to arrival. Deposits are non-refundable for same-week cancellations.',
      gcash_number: '0953 495 4389',
      gcash_name: 'PolChat Garden Resort Admin',
    }

    try {
      const stored = localStorage.getItem('polchat_resort_policies')
      if (stored) return { ...defaultPolicies, ...JSON.parse(stored) }
    } catch (e) {}
    return defaultPolicies
  },

  async updateResortPolicies(newPolicies) {
    try {
      const current = await this.getResortPolicies()
      const merged = { ...current, ...newPolicies }
      localStorage.setItem('polchat_resort_policies', JSON.stringify(merged))

      // When security deposit is changed globally, update all duration_types in Supabase database & local cache
      if (newPolicies.security_deposit !== undefined) {
        const newSecDep = Number(newPolicies.security_deposit)
        try {
          const { error: dtError } = await supabase
            .from('duration_types')
            .update({ sec_dep: newSecDep })
            .neq('duration_id', 0)

          if (dtError) {
            console.warn('Note updating duration_types sec_dep in Supabase:', dtError.message)
          }
        } catch (dbErr) {
          console.error('Failed to update duration_types sec_dep in Supabase:', dbErr)
        }

        // Synchronize locally cached packages
        try {
          const cached = localStorage.getItem('polchat_duration_types')
          if (cached) {
            const parsed = JSON.parse(cached)
            const updated = parsed.map((p) => ({ ...p, sec_dep: newSecDep }))
            localStorage.setItem('polchat_duration_types', JSON.stringify(updated))
          }
        } catch (e) {}
      }

      return merged
    } catch (err) {
      console.error('Failed to update resort policies:', err)
      return null
    }
  },


  // ==========================================
  // 3. RESORT INQUIRIES & CHATS
  // ==========================================
  async getInquiries(opts = {}) {
    if (!opts.force && _adminCache.inquiries) {
      return _adminCache.inquiries
    }
    try {
      const { data, error } = await supabase
        .from('resort_inquiries')
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)
        .order('inquiry_id', { ascending: false })

      if (error) {
        console.error('Error fetching resort_inquiries from Supabase:', error)
        return _adminCache.inquiries || []
      }

      const mapped = (data || []).map((i) => ({
        ...i,
        customer_name: i.customer
          ? `${i.customer.first_name} ${i.customer.last_name || ''}`.trim()
          : `Customer #${i.customer_id}`,
      }))
      _adminCache.inquiries = mapped
      return _adminCache.inquiries
    } catch (err) {
      console.error('Inquiries query exception:', err)
      return _adminCache.inquiries || []
    }
  },

  async createInquiry({ label, message, customerId, customerName }) {
    const nowIso = new Date().toISOString()

    try {
      // 1. Ensure a valid customer_id in customer_accounts to prevent FK 409 Conflict
      const validCustomerId = await this.ensureCustomer({
        customerId,
        customerName,
      })

      // 2. Insert into resort_inquiries
      const { data: inqData, error: inqError } = await supabase
        .from('resort_inquiries')
        .insert([
          {
            inquiry_label: label,
            customer_id: validCustomerId,
            inquiry_status: 'open',
            created_at: nowIso,
            updated_at: nowIso,
          },
        ])
        .select()

      if (inqError || !inqData || inqData.length === 0) {
        console.error('Error creating resort_inquiry in Supabase:', inqError)
        return null
      }

      const createdInquiry = inqData[0]

      // 3. Insert initial message into inquiry_chats
      const { data: chatData, error: chatError } = await supabase
        .from('inquiry_chats')
        .insert([
          {
            inquiry_id: createdInquiry.inquiry_id,
            sender: 'customer',
            message: message,
            sent_at: nowIso,
          },
        ])
        .select()

      if (chatError) {
        console.error('Error inserting initial chat message:', chatError)
      }

      const firstChat = chatData?.[0] || {
        chat_id: Date.now(),
        inquiry_id: createdInquiry.inquiry_id,
        sender: 'customer',
        sender_name: customerName,
        message: message,
        sent_at: nowIso,
      }

      return {
        newInquiry: {
          ...createdInquiry,
          customer_name: customerName,
        },
        firstChat: {
          ...firstChat,
          sender_name: customerName,
        },
      }
    } catch (err) {
      console.error('Create inquiry exception:', err)
      return null
    }
  },

  async assignAdminResponder(inquiryId, adminName) {
    const nowIso = new Date().toISOString()
    try {
      const { error } = await supabase
        .from('resort_inquiries')
        .update({
          admin_responder: adminName,
          inquiry_status: 'in-progress',
          updated_at: nowIso,
        })
        .eq('inquiry_id', inquiryId)

      if (error) {
        console.error('Error assigning admin responder:', error)
      }
    } catch (err) {
      console.error('Assign admin responder exception:', err)
    }
    return this.getInquiries()
  },

  async updateInquiryStatus(inquiryId, status) {
    const nowIso = new Date().toISOString()
    try {
      const { error } = await supabase
        .from('resort_inquiries')
        .update({
          inquiry_status: status,
          updated_at: nowIso,
        })
        .eq('inquiry_id', inquiryId)

      if (error) {
        console.error('Error updating inquiry status:', error)
      }
    } catch (err) {
      console.error('Update inquiry status exception:', err)
    }
    return this.getInquiries()
  },

  async getChats(inquiryId) {
    try {
      const { data, error } = await supabase
        .from('inquiry_chats')
        .select('*')
        .eq('inquiry_id', Number(inquiryId))
        .order('chat_id', { ascending: true })

      if (error) {
        console.error('Error fetching inquiry_chats from Supabase:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Chats query exception:', err)
      return []
    }
  },

  async sendChatMessage({ inquiryId, sender, senderName, message }) {
    const nowIso = new Date().toISOString()
    try {
      const { data, error } = await supabase
        .from('inquiry_chats')
        .insert([
          {
            inquiry_id: Number(inquiryId),
            sender: sender,
            message: message,
            sent_at: nowIso,
          },
        ])
        .select()

      if (error) {
        console.error('Error sending chat message:', error)
        return null
      }

      // If reply is from admin, dispatch email notification to the customer
      if (sender === 'admin') {
        try {
          const { data: inqData } = await supabase
            .from('resort_inquiries')
            .select(`
              *,
              customer:customer_accounts(first_name, last_name, phone_number)
            `)
            .eq('inquiry_id', Number(inquiryId))
            .maybeSingle()

          if (inqData) {
            const customerName = inqData.customer
              ? `${inqData.customer.first_name} ${inqData.customer.last_name || ''}`.trim()
              : (inqData.inquiry_label || 'Valued Guest')

            await EmailService.sendInquiryReplyEmail({
              inquiry: {
                ...inqData,
                customer_name: customerName,
              },
              replyMessage: message,
              adminName: senderName || 'PolChat Staff',
            })
          }
        } catch (emailErr) {
          console.warn('Inquiry reply email dispatch note:', emailErr)
        }
      }

      return {
        ...(data?.[0] || {}),
        sender_name: senderName,
      }
    } catch (err) {
      console.error('Send chat message exception:', err)
      return null
    }
  },

  // ==========================================
  // 4. RESORT RESERVATIONS
  // ==========================================
  // Helper to compress image before upload or base64 storage
  async compressImage(file, maxWidth = 1200, quality = 0.8) {
    if (!file || !file.type.startsWith('image/')) return file
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => resolve(file)
        img.src = e.target.result
      }
      reader.onerror = () => resolve(file)
      reader.readAsDataURL(file)
    })
  },

  async uploadPaymentProof(file) {
    if (!file) return null

    try {
      const processedBlob = await this.compressImage(file, 900, 0.75)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(processedBlob || file)
      })
    } catch (e) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    }
  },

  async getReservations(opts = {}) {
    if (!opts.force && _adminCache.reservations) {
      return _adminCache.reservations
    }
    try {
      const { data, error } = await supabase
        .from('resort_reservations')
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)
        .order('reservation_id', { ascending: false })

      if (error) {
        console.error('Error fetching resort_reservations:', error)
        return _adminCache.reservations || []
      }

      // Load any locally cached proofs, checkouts, and reviews
      let cachedProofs = {}
      let cachedCheckouts = {}
      let cachedReviews = {}
      let registeredUsers = []
      try {
        cachedProofs = JSON.parse(localStorage.getItem('polchat_reservation_proofs') || '{}')
        cachedCheckouts = JSON.parse(localStorage.getItem('polchat_checked_out_reservations') || '{}')
        cachedReviews = JSON.parse(localStorage.getItem('polchat_reviewed_reservations') || '{}')
        registeredUsers = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
      } catch (e) {}

      const mapped = (data || []).map((r) => {
        let extractedProof = r.payment_proof_url || cachedProofs[r.reservation_id] || null
        let extractedPayType = r.payment_type || null
        let extractedDown = r.downpayment_amount
        let extractedRem = r.remaining_balance
        let extractedEmail = r.customer_email || null
        let cleanEventName = r.event_name || 'Resort Stay'

        // Parse encoded metadata from event_name if present
        if (cleanEventName && cleanEventName.includes('__PROOF__')) {
          const matchProof = cleanEventName.match(/__PROOF__(.*?)__(?:PAY|DOWN|REM|EMAIL|CHECKOUT|$)/)
          if (matchProof && matchProof[1]) {
            extractedProof = matchProof[1]
          }
        }
        if (cleanEventName && cleanEventName.includes('__PAY__')) {
          const matchPay = cleanEventName.match(/__PAY__(.*?)__(?:DOWN|REM|EMAIL|CHECKOUT|$)/)
          if (matchPay && matchPay[1]) {
            extractedPayType = matchPay[1]
          }
        }
        if (cleanEventName && cleanEventName.includes('__DOWN__')) {
          const matchDown = cleanEventName.match(/__DOWN__(.*?)__(?:REM|EMAIL|CHECKOUT|$)/)
          if (matchDown && matchDown[1]) {
            extractedDown = Number(matchDown[1])
          }
        }
        if (cleanEventName && cleanEventName.includes('__REM__')) {
          const matchRem = cleanEventName.match(/__REM__(.*?)__(?:EMAIL|CHECKOUT|$)/)
          if (matchRem && matchRem[1]) {
            extractedRem = Number(matchRem[1])
          }
        }
        if (cleanEventName && cleanEventName.includes('__EMAIL__')) {
          const matchEmail = cleanEventName.match(/__EMAIL__(.*?)__(?:PROOF|PAY|DOWN|REM|CHECKOUT|$)/)
          if (matchEmail && matchEmail[1] && matchEmail[1].includes('@')) {
            extractedEmail = matchEmail[1].trim()
          }
        }

        // Clean up event name to look nice in UI
        cleanEventName = cleanEventName
          .split(' __PROOF__')[0]
          .split(' __PAY__')[0]
          .split(' __EMAIL__')[0]
          .split(' __CHECKOUT__')[0]
          .trim()

        const customerName = r.customer
          ? `${r.customer.first_name} ${r.customer.last_name || ''}`.trim()
          : (r.customer_name || `Customer #${r.customer_id}`)

        // If email not found in row/metadata, lookup in registered users
        if (!extractedEmail && registeredUsers.length > 0) {
          const matchedUser = registeredUsers.find((u) => {
            if (r.customer_id && Number(u.id) === Number(r.customer_id)) return true
            const uFullName = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).trim().toLowerCase()
            const rName = customerName.toLowerCase()
            return uFullName && rName && (uFullName === rName || rName.includes(uFullName))
          })
          if (matchedUser?.email) {
            extractedEmail = matchedUser.email
          }
        }

        const totalCost = (r.reservation_cost || 0) + (r.extra_charges || 0)
        const downpayment = extractedDown ?? Math.round(totalCost * 0.5)
        const remaining = extractedRem ?? (totalCost - downpayment)
        const finalPayType = extractedPayType || (extractedProof ? 'gcash' : 'cash')

        const isCheckedOut = !!(
          r.is_checked_out ||
          cachedCheckouts[r.reservation_id] ||
          r.reservation_status === 'completed'
        )

        const isReviewed = !!(
          cachedReviews[r.reservation_id] ||
          r.reservation_status === 'completed'
        )

        return {
          ...r,
          event_name: cleanEventName,
          customer_name: customerName,
          customer_email: extractedEmail || '',
          customer_phone: r.customer?.phone_number ? `0${r.customer.phone_number}` : '',
          payment_proof_url: extractedProof,
          payment_type: finalPayType,
          downpayment_amount: downpayment,
          remaining_balance: isCheckedOut ? 0 : remaining,
          checkout_payment_type: r.checkout_payment_type || cachedCheckouts[r.reservation_id]?.checkout_payment_type || null,
          checkout_proof_url: r.checkout_proof_url || cachedCheckouts[r.reservation_id]?.checkout_proof_url || null,
          is_checked_out: isCheckedOut,
          is_reviewed: isReviewed,
        }
      })

      _adminCache.reservations = mapped
      return _adminCache.reservations
    } catch (err) {
      console.error('Reservation query exception:', err)
      return _adminCache.reservations || []
    }
  },

  async createReservation(reservationData) {
    try {
      const validCustomerId = await this.ensureCustomer({
        customerId: reservationData.customer_id,
        customerName: reservationData.customer_name || reservationData.event_name,
      })

      const totalCost = Number(reservationData.reservation_cost || 0) + Number(reservationData.extra_charges || 0)
      const downpayment = reservationData.downpayment_amount ?? Math.round(totalCost * 0.5)
      const remaining = reservationData.remaining_balance ?? (totalCost - downpayment)
      const proofUrl = reservationData.payment_proof_url || null
      const paymentType = reservationData.payment_type || (proofUrl ? 'gcash' : 'cash')
      const targetCustomerEmail = (reservationData.customer_email || '').trim()

      // Encode metadata into event_name without exceeding database column limits
      const baseEventName = (reservationData.event_name || 'Resort Stay')
        .split(' __PROOF__')[0]
        .split(' __PAY__')[0]
        .split(' __EMAIL__')[0]
        .split(' __CHECKOUT__')[0]
        .trim()

      let metaSuffix = `__PAY__${paymentType}__DOWN__${downpayment}__REM__${remaining}`
      // Only include proof URL in metadata string if it is a short hosted URL (not large base64)
      if (proofUrl && !proofUrl.startsWith('data:') && proofUrl.length < 150) {
        metaSuffix = `__PROOF__${proofUrl}${metaSuffix}`
      }
      if (targetCustomerEmail && targetCustomerEmail.length < 80) {
        metaSuffix = `__EMAIL__${targetCustomerEmail}${metaSuffix}`
      }

      const eventWithMeta = `${baseEventName} ${metaSuffix}`

      const payload = {
        customer_id: validCustomerId,
        guest_count: Number(reservationData.guest_count),
        duration_id: Number(reservationData.duration_id),
        start_date: reservationData.start_date,
        end_date: reservationData.end_date,
        extension_duration: reservationData.extension_duration ? reservationData.start_date : null,
        has_paid_sec_dep: !!reservationData.has_paid_sec_dep,
        has_paid_reservation: paymentType === 'gcash' || !!reservationData.has_paid_reservation,
        reservation_cost: Number(reservationData.reservation_cost),
        extra_charges: Number(reservationData.extra_charges || 0),
        reservation_status: reservationData.reservation_status || 'pending',
        event_name: eventWithMeta,
        payment_proof_url: proofUrl,
        payment_type: paymentType,
        downpayment_amount: downpayment,
        remaining_balance: remaining,
        is_checked_out: false,
      }

      // 1. Attempt insert with all columns
      let { data, error } = await supabase
        .from('resort_reservations')
        .insert([payload])
        .select()

      // 2. Fallback A: If extended helper columns (is_checked_out, payment_type, etc.) are missing,
      // keep payment_proof_url intact and retry!
      if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
        console.warn('Retrying reservation insert with standard columns including payment_proof_url:', error.message)
        const standardPayload = { ...payload }
        delete standardPayload.payment_type
        delete standardPayload.downpayment_amount
        delete standardPayload.remaining_balance
        delete standardPayload.is_checked_out

        const retryRes = await supabase
          .from('resort_reservations')
          .insert([standardPayload])
          .select()

        data = retryRes.data
        error = retryRes.error

        // Fallback B: If even payment_proof_url is missing in DB, strip it as final fallback
        if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
          console.warn('Retrying reservation insert without payment_proof_url column.')
          delete standardPayload.payment_proof_url

          const finalRes = await supabase
            .from('resort_reservations')
            .insert([standardPayload])
            .select()

          data = finalRes.data
          error = finalRes.error
        }
      }

      if (error) {
        console.error('Error creating resort_reservation in Supabase:', error)
      }

      const createdRow = data?.[0] || {
        ...payload,
        reservation_id: Date.now(),
      }

      const finalCreatedObject = {
        ...createdRow,
        event_name: baseEventName,
        customer_name: reservationData.customer_name || reservationData.event_name || `Customer #${validCustomerId}`,
        customer_email: targetCustomerEmail,
        payment_proof_url: proofUrl,
        payment_type: paymentType,
        downpayment_amount: downpayment,
        remaining_balance: remaining,
        reservation_status: reservationData.reservation_status || 'pending',
      }

      // Invalidate caches so any page gets the updated reservation lists immediately
      this.invalidateCache('reservations')
      this.invalidateCache('dashboard')
      this.invalidateCache('analytics')

      // Save to local cache as immediate backup
      try {
        if (createdRow.reservation_id && proofUrl) {
          const cachedProofs = JSON.parse(localStorage.getItem('polchat_reservation_proofs') || '{}')
          cachedProofs[createdRow.reservation_id] = proofUrl
          localStorage.setItem('polchat_reservation_proofs', JSON.stringify(cachedProofs))
        }

        const localList = JSON.parse(localStorage.getItem('polchat_local_reservations') || '[]')
        localList.unshift(finalCreatedObject)
        localStorage.setItem('polchat_local_reservations', JSON.stringify(localList.slice(0, 50)))
      } catch (e) {}

      return finalCreatedObject
    } catch (err) {
      console.error('Create reservation exception:', err)
      return null
    }
  },

  async updateReservationStatus(reservationId, newStatus, explicitEmail = null) {
    try {
      const normalizedStatus = (newStatus || '').toLowerCase()
      const { data, error } = await supabase
        .from('resort_reservations')
        .update({ reservation_status: normalizedStatus })
        .eq('reservation_id', reservationId)
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)

      if (error) {
        console.error('Error updating reservation status:', error)
      }

      // Automatically dispatch email notification to the customer for confirmation or cancellation
      if (
        normalizedStatus === 'confirmed' ||
        normalizedStatus === 'accepted' ||
        normalizedStatus === 'approved' ||
        normalizedStatus === 'cancelled' ||
        normalizedStatus === 'declined' ||
        normalizedStatus === 'rejected'
      ) {
        const cachedRes = (_adminCache.reservations || []).find((r) => r.reservation_id === reservationId)
        const targetRes = data?.[0] || cachedRes || { reservation_id: reservationId, reservation_status: normalizedStatus }
        const customerName = targetRes.customer
          ? `${targetRes.customer.first_name} ${targetRes.customer.last_name || ''}`.trim()
          : (targetRes.customer_name || targetRes.event_name || 'Valued Guest')

        // Resolve customer email reliably
        let resolvedEmail = explicitEmail || targetRes.customer_email || cachedRes?.customer_email || null

        if (!resolvedEmail && targetRes.event_name && targetRes.event_name.includes('__EMAIL__')) {
          const match = targetRes.event_name.match(/__EMAIL__(.*?)__(?:PROOF|PAY|DOWN|REM|CHECKOUT|$)/)
          if (match && match[1] && match[1].includes('@')) {
            resolvedEmail = match[1].trim()
          }
        }

        if (!resolvedEmail && typeof window !== 'undefined') {
          try {
            const registeredUsers = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
            const matchUser = registeredUsers.find((u) => {
              if (targetRes.customer_id && Number(u.id) === Number(targetRes.customer_id)) return true
              const uFullName = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).trim().toLowerCase()
              const rName = (customerName || '').trim().toLowerCase()
              return uFullName && rName && (uFullName === rName || rName.includes(uFullName) || uFullName.includes(rName))
            })
            if (matchUser?.email) {
              resolvedEmail = matchUser.email
            }
          } catch (e) {}
        }

        await EmailService.sendReservationStatusEmail({
          reservation: {
            ...targetRes,
            customer_name: customerName,
            customer_email: resolvedEmail,
          },
          newStatus: normalizedStatus === 'accepted' || normalizedStatus === 'approved' ? 'confirmed' : normalizedStatus === 'declined' || normalizedStatus === 'rejected' ? 'cancelled' : normalizedStatus,
          customerEmail: resolvedEmail,
        })
      }

      if (_adminCache.reservations) {
        _adminCache.reservations = _adminCache.reservations.map((r) =>
          r.reservation_id === reservationId ? { ...r, reservation_status: normalizedStatus } : r
        )
      }
    } catch (err) {
      console.error('Update reservation status exception:', err)
    }
  },

  async checkoutReservation(reservationId, { checkout_payment_type = 'gcash', checkout_proof_url = null } = {}) {
    try {
      // 1. Cache checkout locally
      try {
        const checkedOutList = JSON.parse(localStorage.getItem('polchat_checked_out_reservations') || '{}')
        checkedOutList[reservationId] = {
          checkout_payment_type,
          checkout_proof_url,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem('polchat_checked_out_reservations', JSON.stringify(checkedOutList))
      } catch (e) {}

      // 2. Update Supabase
      const updatePayload = {
        is_checked_out: true,
        remaining_balance: 0,
        has_paid_reservation: true,
      }
      if (checkout_payment_type) updatePayload.checkout_payment_type = checkout_payment_type
      if (checkout_proof_url) updatePayload.checkout_proof_url = checkout_proof_url

      let { data, error } = await supabase
        .from('resort_reservations')
        .update(updatePayload)
        .eq('reservation_id', reservationId)
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)

      if (error) {
        console.warn('Standard checkout update fallback:', error.message)
        const fallbackRes = await supabase
          .from('resort_reservations')
          .update({ has_paid_reservation: true })
          .eq('reservation_id', reservationId)
          .select(`
            *,
            customer:customer_accounts(first_name, last_name, phone_number)
          `)
        data = fallbackRes.data
      }

      const updatedRow = data?.[0] || { reservation_id: reservationId }
      return {
        ...updatedRow,
        is_checked_out: true,
        remaining_balance: 0,
        checkout_payment_type,
        checkout_proof_url,
      }
    } catch (err) {
      console.error('Checkout reservation exception:', err)
      return {
        reservation_id: reservationId,
        is_checked_out: true,
        remaining_balance: 0,
        checkout_payment_type,
        checkout_proof_url,
      }
    }
  },

  async markReservationReviewed(reservationId) {
    try {
      // 1. Cache reviewed state locally
      try {
        const reviewedList = JSON.parse(localStorage.getItem('polchat_reviewed_reservations') || '{}')
        reviewedList[reservationId] = true
        localStorage.setItem('polchat_reviewed_reservations', JSON.stringify(reviewedList))
      } catch (e) {}

      // 2. Update Supabase reservation status to completed
      await supabase
        .from('resort_reservations')
        .update({
          reservation_status: 'completed',
          is_checked_out: true,
        })
        .eq('reservation_id', reservationId)
    } catch (err) {
      console.error('Mark reservation reviewed exception:', err)
    }
  },

  async updateReservationPayment(reservationId, updates) {
    try {
      const { error } = await supabase
        .from('resort_reservations')
        .update(updates)
        .eq('reservation_id', reservationId)

      if (error) {
        console.error('Error updating reservation payment:', error)
      }
    } catch (err) {
      console.error('Update reservation payment exception:', err)
    }
  },

  // ==========================================
  // 5. RESORT VISITATIONS (OCULAR VISITS)
  // ==========================================
  async getVisitations(opts = {}) {
    if (!opts.force && _adminCache.visitations) {
      return _adminCache.visitations
    }
    try {
      const { data, error } = await supabase
        .from('resort_visitations')
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)
        .order('visitation_id', { ascending: false })

      if (error) {
        console.error('Error fetching resort_visitations:', error)
        return _adminCache.visitations || []
      }

      const mapped = (data || []).map((v) => ({
        ...v,
        customer_name: v.customer
          ? `${v.customer.first_name} ${v.customer.last_name || ''}`.trim()
          : `Customer #${v.customer_id}`,
        customer_phone: v.customer?.phone_number ? `0${v.customer.phone_number}` : '',
        slot_type:
          v.visitation_start_date && v.visitation_start_date.includes('09:')
            ? 'Morning (9:00 AM - 11:00 AM)'
            : 'Afternoon (2:00 PM - 4:00 PM)',
      }))
      _adminCache.visitations = mapped
      return _adminCache.visitations
    } catch (err) {
      console.error('Visitations query exception:', err)
      return _adminCache.visitations || []
    }
  },

  async createVisitation(visitationData) {
    try {
      const validCustomerId = await this.ensureCustomer({
        customerId: visitationData.customer_id,
        customerName: visitationData.customer_name || 'Customer Account',
      })

      const payload = {
        customer_id: validCustomerId,
        guest_count: Number(visitationData.guest_count),
        visitation_start_date: visitationData.visitation_start_date,
        visitation_end_date: visitationData.visitation_end_date,
        visitation_status: visitationData.visitation_status || 'pending',
      }

      const { data, error } = await supabase
        .from('resort_visitations')
        .insert([payload])
        .select()

      if (error) {
        console.error('Error creating visitation in Supabase:', error)
        return null
      }
      const created = data?.[0] || payload
      if (_adminCache.visitations) {
        _adminCache.visitations = [created, ..._adminCache.visitations]
      }
      return created
    } catch (err) {
      console.error('Create visitation exception:', err)
      return null
    }
  },

  async updateVisitationStatus(visitationId, newStatus) {
    try {
      const { error } = await supabase
        .from('resort_visitations')
        .update({ visitation_status: newStatus })
        .eq('visitation_id', visitationId)

      if (error) {
        console.error('Error updating visitation status:', error)
      }
      if (_adminCache.visitations) {
        _adminCache.visitations = _adminCache.visitations.map((v) =>
          v.visitation_id === visitationId ? { ...v, visitation_status: newStatus } : v
        )
      }
    } catch (err) {
      console.error('Update visitation status exception:', err)
    }
  },

  // ==========================================
  // 6. CUSTOMER REVIEWS
  // ==========================================
  async getReviews(opts = {}) {
    if (!opts.force && _adminCache.reviews) {
      return _adminCache.reviews
    }
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select(`
          *,
          customer:customer_accounts(first_name, last_name)
        `)
        .order('review_id', { ascending: false })

      if (error) {
        console.error('Error fetching customer_reviews from Supabase:', error)
        return _adminCache.reviews || []
      }

      const mapped = (data || []).map((r) => {
        const commentText = r.review_comment || r.comment || r.feedback || r.review_text || ''
        return {
          ...r,
          review_comment: commentText,
          comment: commentText,
          customer_name: r.customer
            ? `${r.customer.first_name} ${r.customer.last_name || ''}`.trim()
            : (r.customer_name || `Customer #${r.customer_id}`),
        }
      })
      _adminCache.reviews = mapped
      return _adminCache.reviews
    } catch (err) {
      console.error('Reviews query exception:', err)
      return _adminCache.reviews || []
    }
  },

  async addReview({ customerId, customerName = 'Guest', stars = 5, comment = '', reservationId = null }) {
    const nowIso = new Date().toISOString()
    try {
      const validCustomerId = await this.ensureCustomer({
        customerId,
        customerName,
      })

      const { data, error } = await supabase
        .from('customer_reviews')
        .insert([
          {
            customer_id: validCustomerId,
            review_stars: Number(stars),
            review_comment: comment,
            date_submitted: nowIso,
          },
        ])
        .select()

      if (error) {
        console.error('Error inserting customer_review in Supabase:', error)
      }

      if (reservationId) {
        await this.markReservationReviewed(reservationId)
      }

      return data?.[0] || {
        review_id: Math.floor(100 + Math.random() * 900),
        customer_id: validCustomerId,
        review_stars: Number(stars),
        review_comment: comment,
        comment: comment,
        customer_name: customerName,
        date_submitted: nowIso,
      }
    } catch (err) {
      console.error('Add review exception:', err)
      return null
    }
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

  // ==========================================
  // 7. GALLERY MANAGEMENT (13 CAPACITY SLOTS)
  // ==========================================
  getDefaultGalleryItems() {
    return [
      {
        slot_id: 1,
        label: 'PHOTO 01',
        title: 'Grand Resort Grounds',
        category: 'Resort Highlights',
        image_url: null,
        row_type: 'large',
        caption: 'Expansive landscaped grounds and greenery surrounding the resort.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 2,
        label: 'PHOTO 02',
        title: 'Pavilion Celebration',
        category: 'Event Gatherings',
        image_url: null,
        row_type: 'medium',
        caption: 'Open-air events and festive gatherings under the pavilion.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 3,
        label: 'PHOTO 03',
        title: 'Veranda Sunset View',
        category: 'Scenic Grounds',
        image_url: null,
        row_type: 'medium',
        caption: 'Picturesque sunsets viewed from our wooden terrace.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 4,
        label: 'PHOTO 04',
        title: 'Cabin Room Comfort',
        category: 'Cozy Corners',
        image_url: null,
        row_type: 'small',
        caption: 'Air-conditioned private cabin accommodations.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 5,
        label: 'PHOTO 05',
        title: 'Tree House Canopy',
        category: 'Cozy Corners',
        image_url: null,
        row_type: 'small',
        caption: 'Unique elevated tree house retreat surrounded by trees.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 6,
        label: 'PHOTO 06',
        title: 'Bahay Kubo Sanctuary',
        category: 'Lush Botanicals',
        image_url: null,
        row_type: 'small',
        caption: 'Traditional Filipino kubo cottages for native relaxation.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 7,
        label: 'PHOTO 07',
        title: 'Lush Botanical Garden',
        category: 'Lush Botanicals',
        image_url: null,
        row_type: 'large',
        caption: 'Vibrant flowering flora, palms, and winding pathways.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 8,
        label: 'PHOTO 08',
        title: 'Refreshing Swimming Pool',
        category: 'Resort Highlights',
        image_url: null,
        row_type: 'medium',
        caption: 'Crystal-clear swimming pools for kids and adults.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 9,
        label: 'PHOTO 09',
        title: 'Evening Garden Lights',
        category: 'Scenic Grounds',
        image_url: null,
        row_type: 'medium',
        caption: 'Fairy lights and evening ambiance under the night sky.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 10,
        label: 'PHOTO 10',
        title: 'Outdoor Gathering Nook',
        category: 'Cozy Corners',
        image_url: null,
        row_type: 'small',
        caption: 'Intimate seating corners for group conversations.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 11,
        label: 'PHOTO 11',
        title: 'Private Family Lounge',
        category: 'Cozy Corners',
        image_url: null,
        row_type: 'small',
        caption: 'Dedicated family relaxation and dining lounge.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 12,
        label: 'PHOTO 12',
        title: 'Scenic Landscape Walk',
        category: 'Scenic Grounds',
        image_url: null,
        row_type: 'small',
        caption: 'Peaceful garden strolls and picture-perfect photo spots.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
      {
        slot_id: 13,
        label: 'PHOTO 13',
        title: 'PolChat Panoramic Horizon',
        category: 'Resort Highlights',
        image_url: null,
        row_type: 'large',
        caption: 'Wide-angle panoramic horizon view of the entire resort grounds.',
        last_updated: '2026-10-09T00:00:00.000Z',
      },
    ]
  },

  async getGalleryItems() {
    try {
      const saved = localStorage.getItem('polchat_gallery_items')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 13) {
          return parsed
        }
      }
    } catch (e) {}

    const defaults = this.getDefaultGalleryItems()
    try {
      localStorage.setItem('polchat_gallery_items', JSON.stringify(defaults))
    } catch (e) {}
    return defaults
  },

  async updateGalleryItem(slotId, updates) {
    try {
      const items = await this.getGalleryItems()
      const updated = items.map((item) => {
        if (Number(item.slot_id) === Number(slotId)) {
          return {
            ...item,
            ...updates,
            last_updated: new Date().toISOString(),
          }
        }
        return item
      })

      localStorage.setItem('polchat_gallery_items', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('polchat_gallery_updated', { detail: updated }))
      return updated
    } catch (err) {
      console.error('Failed to update gallery slot:', err)
      return null
    }
  },

  async resetGalleryItem(slotId) {
    try {
      const defaults = this.getDefaultGalleryItems()
      const defaultItem = defaults.find((d) => Number(d.slot_id) === Number(slotId))
      if (!defaultItem) return null
      return this.updateGalleryItem(slotId, defaultItem)
    } catch (err) {
      console.error('Failed to reset gallery slot:', err)
      return null
    }
  },

  async resetAllGalleryItems() {
    try {
      const defaults = this.getDefaultGalleryItems()
      localStorage.setItem('polchat_gallery_items', JSON.stringify(defaults))
      window.dispatchEvent(new CustomEvent('polchat_gallery_updated', { detail: defaults }))
      return defaults
    } catch (err) {
      console.error('Failed to reset all gallery items:', err)
      return null
    }
  },
}
