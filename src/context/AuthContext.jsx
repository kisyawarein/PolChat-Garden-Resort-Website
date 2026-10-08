import { createContext, useContext, useState, useEffect } from 'react'
import { DataService } from '../services/dataService'

const AuthContext = createContext(null)

// Standard configured user accounts
const DEFAULT_USERS = [
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
  {
    id: 42,
    username: 'customer',
    first_name: 'Raishawn',
    last_name: 'Alejandro',
    name: 'Raishawn Alejandro',
    email: 'raishawn@gmail.com',
    password: 'customer123',
    birthday: '1995-06-12',
    phone: '09534954389',
    role: 'customer',
  },
  {
    id: 42,
    username: 'raishawn',
    first_name: 'Raishawn',
    last_name: 'Alejandro',
    name: 'Raishawn Alejandro',
    email: 'raishawn@gmail.com',
    password: 'customer123',
    birthday: '1995-06-12',
    phone: '09534954389',
    role: 'customer',
  },
  {
    id: 3,
    username: 'keisha',
    first_name: 'Keisha',
    last_name: 'Medina',
    name: 'Keisha Medina',
    email: 'keisha@gmail.com',
    password: 'customer123',
    birthday: '1996-03-24',
    phone: '09488318687',
    role: 'customer',
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
    
    // 1. Check if matches preconfigured system users
    let found = DEFAULT_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    )

    if (found) {
      // If admin account, login as admin directly
      if (found.role === 'admin') {
        setUser(found)
        setIsAuthModalOpen(false)
        return { success: true, user: found }
      }
      
      // If customer account, ensure in Supabase customer_accounts
      const realCustomerId = await DataService.ensureCustomer({
        customerId: found.id,
        customerName: found.name,
        phone: Number(found.phone.replace(/\D/g, '')) || 9171234567,
      })
      found = { ...found, id: realCustomerId }
      setUser(found)
      setIsAuthModalOpen(false)
      return { success: true, user: found }
    }

    // 2. Dynamic credentials evaluation
    // If username is "admin" or email is admin email, treat as admin
    const isAdminAccount = cleanId === 'admin' || cleanId === 'polchat_admin' || cleanId === 'admin@polchat2k20@gmail.com' || cleanId.startsWith('admin_')

    if (isAdminAccount) {
      const adminUser = {
        id: 999,
        username: cleanId,
        first_name: 'Admin',
        last_name: 'Staff',
        name: 'Admin Management',
        email: cleanId.includes('@') ? cleanId : 'polchat2k20@gmail.com',
        birthday: '1990-01-01',
        phone: '09534954389',
        role: 'admin',
      }
      setUser(adminUser)
      setIsAuthModalOpen(false)
      return { success: true, user: adminUser }
    }

    // Otherwise, user is treated strictly as Customer
    const nameFallback = cleanId.split('@')[0]
    const realCustomerId = await DataService.ensureCustomer({
      customerName: nameFallback,
      phone: 9171234567,
    })

    const customerUser = {
      id: realCustomerId,
      username: nameFallback,
      first_name: nameFallback,
      last_name: '',
      name: nameFallback,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`,
      birthday: '1995-01-01',
      phone: '09171234567',
      role: 'customer',
    }

    setUser(customerUser)
    setIsAuthModalOpen(false)
    return { success: true, user: customerUser }
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
      phone_number: 9171234567,
    })

    const customerId = created ? created.customer_id : 1

    const newUser = {
      id: customerId,
      username: cleanFirst.toLowerCase() || 'customer',
      first_name: cleanFirst,
      last_name: cleanLast,
      name: fullName,
      email: cleanEmail,
      birthday: birthday || '',
      phone: '09171234567',
      role: 'customer', // Customer accounts always stay as customers
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
