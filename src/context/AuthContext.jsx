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

    // 2. Check registered accounts from local browser storage cache
    let localMatch = null
    try {
      const savedAccounts = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
      localMatch = savedAccounts.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.first_name && u.first_name.toLowerCase() === cleanId) ||
          (u.last_name && u.last_name.toLowerCase() === cleanId) ||
          (u.name && u.name.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId)
      )
      if (localMatch) {
        if (!localMatch.password || localMatch.password !== cleanPass) {
          return { success: false, error: 'Incorrect password. Please try again.' }
        }
        setUser(localMatch)
        setIsAuthModalOpen(false)
        return { success: true, user: localMatch }
      }
    } catch (e) {}

    // 4. Query customer_accounts from Supabase
    try {
      const customers = await DataService.getCustomers({ force: true })
      const match = (customers || []).find((c) => {
        const first = (c.first_name || '').trim().toLowerCase()
        const last = (c.last_name || '').trim().toLowerCase()
        const full = `${first} ${last}`.trim().toLowerCase()
        const email = (c.email || '').trim().toLowerCase()
        return (
          first === cleanId ||
          last === cleanId ||
          full === cleanId ||
          email === cleanId ||
          (c.customer_id && String(c.customer_id) === cleanId)
        )
      })

      if (match) {
        // Check password against stored password in database, or fallback to customer123
        const expectedPassword = match.password || null
        const isPasswordValid = expectedPassword
          ? cleanPass === expectedPassword
          : cleanPass === 'customer123' || (localMatch && localMatch.password === cleanPass)

        if (!isPasswordValid) {
          return { success: false, error: 'Incorrect password. Please try again.' }
        }

        const customerUser = {
          id: match.customer_id,
          username: (match.first_name || 'customer').toLowerCase(),
          first_name: match.first_name,
          last_name: match.last_name || '',
          name: `${match.first_name} ${match.last_name || ''}`.trim(),
          email: match.email || `${(match.first_name || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          password: cleanPass,
          phone: match.phone_number ? `0${match.phone_number}` : '09171234567',
          role: 'customer',
        }

        // Cache into local browser registry for instant future loads
        try {
          const savedAccounts = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
          const updated = [customerUser, ...savedAccounts.filter((u) => u.id !== customerUser.id)]
          localStorage.setItem('polchat_registered_users', JSON.stringify(updated))
        } catch (e) {}

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
    const cleanEmail = (email || '').trim()
    const fullName = `${cleanFirst} ${cleanLast}`.trim() || 'Customer Guest'

    // Create directly in Supabase customer_accounts
    const created = await DataService.addCustomer({
      first_name: cleanFirst || 'Customer',
      last_name: cleanLast,
      email: cleanEmail,
      password: password,
      phone_number: 9171234567,
    })

    const customerId = created ? created.customer_id : Math.floor(100 + Math.random() * 900)

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

    // Save to registered users list
    try {
      const existing = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
      const updated = [newUser, ...existing.filter((u) => u.email !== cleanEmail)]
      localStorage.setItem('polchat_registered_users', JSON.stringify(updated))
    } catch (e) {}

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
