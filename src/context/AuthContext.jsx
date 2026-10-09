import { createContext, useContext, useState, useEffect } from 'react'
import { DataService } from '../services/dataService'

const AuthContext = createContext(null)

// Admin management accounts
const ADMIN_USERS = [
  {
    id: 999,
    username: 'admin',
    first_name: 'Admin',
    last_name: 'Management',
    name: 'Admin Management',
    email: 'polchat2k20@gmail.com',
    password: 'admin123',
    birthday: '1990-01-01',
    phone: '09534954389',
    role: 'admin',
  },
  {
    id: 998,
    username: 'polchat_admin',
    first_name: 'Admin',
    last_name: 'Staff',
    name: 'Admin Staff',
    email: 'polchat2k20@gmail.com',
    password: 'admin123',
    birthday: '1988-05-20',
    phone: '09534954389',
    role: 'admin',
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('polchat_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin') // 'signin' | 'signup'

  useEffect(() => {
    if (user) {
      localStorage.setItem('polchat_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('polchat_auth_user')
    }
  }, [user])

  const login = async ({ identifier, password }) => {
    const cleanId = (identifier || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both your identifier and password.' }
    }

    // 1. Admin login verification (by username, role name, or admin email)
    const adminMatch = ADMIN_USERS.find(
      (a) =>
        a.username.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId ||
        a.name.toLowerCase() === cleanId ||
        cleanId === 'admin' ||
        cleanId === 'management' ||
        cleanId === 'polchat_admin'
    )

    if (adminMatch) {
      if (cleanPass !== adminMatch.password) {
        return { success: false, error: 'Incorrect password for admin account.' }
      }
      setUser(adminMatch)
      setIsAuthModalOpen(false)
      return { success: true, user: adminMatch }
    }

    // 2. Query customer_accounts directly from Supabase and match name, id, or registered email
    try {
      const customers = await DataService.getCustomers({ force: true })
      const emailMap = DataService.getRegisteredEmails()

      const match = (customers || []).find((c) => {
        const first = (c.first_name || '').trim().toLowerCase()
        const last = (c.last_name || '').trim().toLowerCase()
        const full = `${first} ${last}`.trim().toLowerCase()
        const custEmail = (emailMap[c.customer_id] || emailMap[String(c.customer_id)] || c.email || '').trim().toLowerCase()

        return (
          first === cleanId ||
          last === cleanId ||
          full === cleanId ||
          (custEmail && custEmail === cleanId) ||
          (c.customer_id && String(c.customer_id) === cleanId)
        )
      })

      if (match) {
        // Strict customer password verification
        const credential = DataService.findAccountCredential({
          customerId: match.customer_id,
          email: cleanId.includes('@') ? cleanId : (emailMap[match.customer_id] || match.email),
          firstName: match.first_name,
          lastName: match.last_name,
          identifier: cleanId,
        })

        const expectedPassword = credential?.password || match.password || null

        if (expectedPassword) {
          if (cleanPass !== expectedPassword) {
            return { success: false, error: 'Incorrect password. Please try again.' }
          }
        } else {
          // If no recorded password, only allow resort default or reject
          if (cleanPass !== 'customer123') {
            return { success: false, error: 'Incorrect password. Please try again.' }
          }
        }

        const matchedEmail = (
          credential?.email ||
          emailMap[match.customer_id] ||
          emailMap[String(match.customer_id)] ||
          match.email ||
          (cleanId.includes('@') ? cleanId : `${(match.first_name || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`)
        ).trim()

        const customerUser = {
          id: match.customer_id,
          username: (match.first_name || 'customer').toLowerCase(),
          first_name: match.first_name,
          last_name: match.last_name || '',
          name: `${match.first_name} ${match.last_name || ''}`.trim(),
          email: matchedEmail,
          password: cleanPass,
          phone: match.phone_number ? `0${match.phone_number}` : '09171234567',
          role: 'customer',
        }

        setUser(customerUser)
        setIsAuthModalOpen(false)
        return { success: true, user: customerUser }
      }
    } catch (err) {
      console.error('Login customer lookup error:', err)
    }

    // Return error if not found in database
    return {
      success: false,
      error: 'Account not found in the database. Please check your credentials or create an account.',
    }
  }

  const signup = async ({ firstName, lastName, birthday, email, password }) => {
    const cleanFirst = (firstName || '').trim()
    const cleanLast = (lastName || '').trim()
    const cleanEmail = (email || '').trim().toLowerCase()
    const fullName = `${cleanFirst} ${cleanLast}`.trim() || 'Customer Guest'

    // Check existing customers in Supabase to guarantee uniqueness of First and Last Name
    try {
      const lowerFirst = cleanFirst.toLowerCase()
      const lowerLast = cleanLast.toLowerCase()

      const conflict = await DataService.checkAccountConflict({
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
      })

      if (conflict && conflict.hasConflict) {
        return {
          success: false,
          error: `${conflict.message} Please use a unique first name, last name, and email or sign in.`,
        }
      }
    } catch (e) {
      console.error('Signup validation error:', e)
    }

    // Create directly in Supabase customer_accounts
    const created = await DataService.addCustomer({
      first_name: cleanFirst || 'Customer',
      last_name: cleanLast,
      email: cleanEmail,
      password: password,
      phone_number: 9171234567,
    })

    if (!created) {
      return { success: false, error: 'Failed to create account. Please try again.' }
    }

    const customerId = created ? created.customer_id : Math.floor(100 + Math.random() * 900)
    DataService.saveAccountCredential(customerId, { email: cleanEmail, password })

    const newUser = {
      id: customerId,
      username: cleanFirst.toLowerCase() || 'customer',
      first_name: cleanFirst,
      last_name: cleanLast,
      name: fullName,
      email: cleanEmail,
      password: password,
      birthday: birthday || '',
      phone: '09171234567',
      role: 'customer',
    }

    setUser(newUser)
    setIsAuthModalOpen(false)
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
