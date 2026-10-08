import { supabase } from './supabase'
import { EmailService } from './emailService'

export const DataService = {
  // Helper: Ensure customer exists in customer_accounts table
  async ensureCustomer({ customerId, customerName, phone = 9171234567 }) {
    try {
      if (customerId && typeof customerId === 'number' && customerId < 100000000000) {
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
      const nameParts = (customerName || 'Juan Dela Cruz').trim().split(' ')
      const firstName = nameParts[0] || 'Juan'
      const lastName = nameParts.slice(1).join(' ') || 'Dela Cruz'

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

      // Fallback: fetch any existing customer or default to 1
      const { data: anyCust } = await supabase
        .from('customer_accounts')
        .select('customer_id')
        .limit(1)

      if (anyCust && anyCust.length > 0) {
        return anyCust[0].customer_id
      }
    } catch (err) {
      console.error('Error ensuring customer:', err)
    }
    return 1
  },

  // ==========================================
  // 1. CUSTOMER ACCOUNTS
  // ==========================================
  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customer_accounts')
        .select('*')
        .order('customer_id', { ascending: false })

      if (error) {
        console.error('Error fetching customer_accounts:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Customer fetch exception:', err)
      return []
    }
  },

  async addCustomer(customer) {
    try {
      const newCustomer = {
        first_name: customer.first_name,
        last_name: customer.last_name || '',
        phone_number: customer.phone_number ? Number(customer.phone_number) : null,
        date_create: new Date().toISOString().split('T')[0],
        date_modified: new Date().toISOString().split('T')[0],
      }

      const { data, error } = await supabase
        .from('customer_accounts')
        .insert([newCustomer])
        .select()

      if (error) {
        console.error('Error inserting customer:', error)
        return null
      }
      return data?.[0] || newCustomer
    } catch (err) {
      console.error('Customer insert exception:', err)
      return null
    }
  },

  // ==========================================
  // 2. DURATION TYPES (RESORT PACKAGES & CHARGES)
  // ==========================================
  async getDurationTypes() {
    try {
      const { data, error } = await supabase
        .from('duration_types')
        .select('*')
        .order('duration_id', { ascending: true })

      if (!error && data && data.length > 0) {
        localStorage.setItem('polchat_duration_types', JSON.stringify(data))
        return data
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

      // 2. Cache updated packages locally for instant smooth sync
      const current = await this.getDurationTypes()
      const updatedList = current.map((p) =>
        p.duration_id === Number(durationId) ? { ...p, ...updates } : p
      )
      localStorage.setItem('polchat_duration_types', JSON.stringify(updatedList))

      if (error) {
        console.warn('Supabase duration_types update note:', error.message)
      }
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
      return merged
    } catch (err) {
      console.error('Failed to update resort policies:', err)
      return null
    }
  },


  // ==========================================
  // 3. RESORT INQUIRIES & CHATS
  // ==========================================
  async getInquiries() {
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
        return []
      }

      return (data || []).map((i) => ({
        ...i,
        customer_name: i.customer
          ? `${i.customer.first_name} ${i.customer.last_name || ''}`.trim()
          : `Customer #${i.customer_id}`,
      }))
    } catch (err) {
      console.error('Inquiries query exception:', err)
      return []
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
      const processedBlob = await this.compressImage(file, 1000, 0.7)
      const cleanFileName = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`
      const filePath = `receipts/${cleanFileName}`

      // List candidate storage buckets to try in Supabase Storage
      const candidateBuckets = ['payment-proofs', 'receipts', 'proofs', 'attachments', 'public']
      for (const bucket of candidateBuckets) {
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, processedBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/jpeg',
            })

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath)

            if (publicUrlData?.publicUrl) {
              return publicUrlData.publicUrl
            }
          }
        } catch (bErr) {}
      }
    } catch (storageErr) {
      // Gracefully continue to base64 fallback
    }

    // 2. Reliable Fallback: Convert to Base64 Data URL so proof is NEVER lost
    return new Promise((resolve) => {
      try {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      } catch (e) {
        resolve(null)
      }
    })
  },

  async getReservations() {
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
        return []
      }

      // Load any locally cached proofs as extra layer
      let cachedProofs = {}
      try {
        cachedProofs = JSON.parse(localStorage.getItem('polchat_reservation_proofs') || '{}')
      } catch (e) {}

      return (data || []).map((r) => {
        let extractedProof = r.payment_proof_url || cachedProofs[r.reservation_id] || null
        let extractedPayType = r.payment_type || null
        let extractedDown = r.downpayment_amount
        let extractedRem = r.remaining_balance
        let cleanEventName = r.event_name || 'Resort Stay'

        // Parse encoded metadata from event_name if present
        if (cleanEventName && cleanEventName.includes('__PROOF__')) {
          const matchProof = cleanEventName.match(/__PROOF__(.*?)__(?:PAY|DOWN|REM|$)/)
          if (matchProof && matchProof[1]) {
            extractedProof = matchProof[1]
          }
        }
        if (cleanEventName && cleanEventName.includes('__PAY__')) {
          const matchPay = cleanEventName.match(/__PAY__(.*?)__(?:DOWN|REM|$)/)
          if (matchPay && matchPay[1]) {
            extractedPayType = matchPay[1]
          }
        }
        if (cleanEventName && cleanEventName.includes('__DOWN__')) {
          const matchDown = cleanEventName.match(/__DOWN__(.*?)__(?:REM|$)/)
          if (matchDown && matchDown[1]) {
            extractedDown = Number(matchDown[1])
          }
        }
        if (cleanEventName && cleanEventName.includes('__REM__')) {
          const matchRem = cleanEventName.match(/__REM__(.*?)$/)
          if (matchRem && matchRem[1]) {
            extractedRem = Number(matchRem[1])
          }
        }

        // Clean up event name to look nice in UI
        cleanEventName = cleanEventName.split(' __PROOF__')[0].split(' __PAY__')[0].trim()

        const totalCost = (r.reservation_cost || 0) + (r.extra_charges || 0)
        const downpayment = extractedDown ?? Math.round(totalCost * 0.5)
        const remaining = extractedRem ?? (totalCost - downpayment)
        const finalPayType = extractedPayType || (extractedProof ? 'gcash' : 'cash')

        return {
          ...r,
          event_name: cleanEventName,
          customer_name: r.customer
            ? `${r.customer.first_name} ${r.customer.last_name || ''}`.trim()
            : `Customer #${r.customer_id}`,
          customer_phone: r.customer?.phone_number ? `0${r.customer.phone_number}` : '',
          payment_proof_url: extractedProof,
          payment_type: finalPayType,
          downpayment_amount: downpayment,
          remaining_balance: remaining,
          checkout_payment_type: r.checkout_payment_type || null,
          checkout_proof_url: r.checkout_proof_url || null,
          is_checked_out: !!r.is_checked_out,
        }
      })
    } catch (err) {
      console.error('Reservation query exception:', err)
      return []
    }
  },

  async createReservation(reservationData) {
    try {
      const validCustomerId = await this.ensureCustomer({
        customerId: reservationData.customer_id,
        customerName: reservationData.event_name,
      })

      const totalCost = Number(reservationData.reservation_cost || 0) + Number(reservationData.extra_charges || 0)
      const downpayment = reservationData.downpayment_amount ?? Math.round(totalCost * 0.5)
      const remaining = reservationData.remaining_balance ?? (totalCost - downpayment)
      const proofUrl = reservationData.payment_proof_url || null
      const paymentType = reservationData.payment_type || (proofUrl ? 'gcash' : 'cash')

      // Encode metadata into event_name to guarantee persistence across all browsers/devices
      // even if Supabase table columns are not yet manually added
      const baseEventName = (reservationData.event_name || 'Resort Stay').split(' __PROOF__')[0].split(' __PAY__')[0].trim()
      const eventWithMeta = proofUrl
        ? `${baseEventName} __PROOF__${proofUrl}__PAY__${paymentType}__DOWN__${downpayment}__REM__${remaining}`
        : `${baseEventName} __PAY__${paymentType}__DOWN__${downpayment}__REM__${remaining}`

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

      // 1. Attempt insert with full payload
      let { data, error } = await supabase
        .from('resort_reservations')
        .insert([payload])
        .select()

      // 2. Fallback: If DB table schema cache is missing new columns, strip optional columns and retry
      if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
        console.warn('Some reservation columns not yet created in Supabase. Inserting standard compatible payload with metadata backup.')
        const fallbackPayload = { ...payload }
        delete fallbackPayload.payment_proof_url
        delete fallbackPayload.payment_type
        delete fallbackPayload.downpayment_amount
        delete fallbackPayload.remaining_balance
        delete fallbackPayload.is_checked_out

        const fallbackRes = await supabase
          .from('resort_reservations')
          .insert([fallbackPayload])
          .select()

        data = fallbackRes.data
        error = fallbackRes.error
      }

      if (error) {
        console.error('Error creating resort_reservation in Supabase:', error)
        return null
      }

      const createdRow = data?.[0] || payload

      // Save to local cache as extra backup
      if (createdRow.reservation_id && proofUrl) {
        try {
          const cachedProofs = JSON.parse(localStorage.getItem('polchat_reservation_proofs') || '{}')
          cachedProofs[createdRow.reservation_id] = proofUrl
          localStorage.setItem('polchat_reservation_proofs', JSON.stringify(cachedProofs))
        } catch (e) {}
      }

      return {
        ...createdRow,
        event_name: baseEventName,
        payment_proof_url: proofUrl,
        payment_type: paymentType,
        downpayment_amount: downpayment,
        remaining_balance: remaining,
      }
    } catch (err) {
      console.error('Create reservation exception:', err)
      return null
    }
  },

  async updateReservationStatus(reservationId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('resort_reservations')
        .update({ reservation_status: newStatus })
        .eq('reservation_id', reservationId)
        .select(`
          *,
          customer:customer_accounts(first_name, last_name, phone_number)
        `)

      if (error) {
        console.error('Error updating reservation status:', error)
      }

      // Automatically dispatch email notification to the customer for confirmation or cancellation
      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        const targetRes = data?.[0] || { reservation_id: reservationId, reservation_status: newStatus }
        const customerName = targetRes.customer
          ? `${targetRes.customer.first_name} ${targetRes.customer.last_name || ''}`.trim()
          : (targetRes.event_name || 'Valued Guest')

        await EmailService.sendReservationStatusEmail({
          reservation: {
            ...targetRes,
            customer_name: customerName,
          },
          newStatus,
        })
      }
    } catch (err) {
      console.error('Update reservation status exception:', err)
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

  async checkoutReservation(reservationId, { checkout_payment_type, checkout_proof_url }) {
    try {
      const updates = {
        has_paid_reservation: true,
        has_paid_sec_dep: true,
        remaining_balance: 0,
        is_checked_out: true,
        checkout_payment_type: checkout_payment_type || 'cash',
        checkout_proof_url: checkout_proof_url || null,
        reservation_status: 'confirmed',
      }

      const { data, error } = await supabase
        .from('resort_reservations')
        .update(updates)
        .eq('reservation_id', reservationId)
        .select()

      if (error) {
        console.warn('Supabase checkout update note:', error.message)
      }
      return data?.[0] || updates
    } catch (err) {
      console.error('Checkout reservation exception:', err)
      return null
    }
  },


  // ==========================================
  // 5. RESORT VISITATIONS (OCULAR VISITS)
  // ==========================================
  async getVisitations() {
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
        return []
      }

      return (data || []).map((v) => ({
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
    } catch (err) {
      console.error('Visitations query exception:', err)
      return []
    }
  },

  async createVisitation(visitationData) {
    try {
      const validCustomerId = await this.ensureCustomer({
        customerId: visitationData.customer_id,
        customerName: 'Juan Dela Cruz',
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
      return data?.[0] || payload
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
    } catch (err) {
      console.error('Update visitation status exception:', err)
    }
  },

  // ==========================================
  // 6. CUSTOMER REVIEWS
  // ==========================================
  async getReviews() {
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
        return []
      }

      return (data || []).map((r) => ({
        ...r,
        customer_name: r.customer
          ? `${r.customer.first_name} ${r.customer.last_name || ''}`.trim()
          : `Customer #${r.customer_id}`,
      }))
    } catch (err) {
      console.error('Reviews query exception:', err)
      return []
    }
  },

  async addReview({ customerId, customerName = 'Guest', stars = 5, comment = '' }) {
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
        return null
      }
      return data?.[0] || null
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
}
