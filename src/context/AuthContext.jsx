import { createContext, useContext, useState, useEffect } from 'react'
import { DataService } from '../services/dataService'

const AuthContext = createContext(null)

// Standard configured user credentials
const DEFAULT_USERS = [
  {
    id: 999,
    username: 'admin',
    name: 'Admin Sarah',
    email: 'admin@polchatresort.com',
    password: 'admin123',
    birthday: '1990-01-01',
    phone: '09998887766',
    role: 'admin',
  },
  {
    id: 998,
    username: 'polchat_admin',
    name: 'Admin Management',
    email: 'manager@polchatresort.com',
    password: 'admin123',
    birthday: '1988-05-20',
    phone: '09991112233',
    role: 'admin',
  },
  {
    id: 42,
    username: 'customer',
    name: 'Raishawn Alejandro',
    email: 'raishawn@polchatresort.com',
    password: 'customer123',
    birthday: '1995-06-12',
    phone: '09534954389',
    role: 'customer',
  },
  {
    id: 42,
    username: 'raishawn',
    name: 'Raishawn Alejandro',
    email: 'raishawn@polchatresort.com',
    password: 'customer123',
    birthday: '1995-06-12',
    phone: '09534954389',
    role: 'customer',
  },
  {
    id: 3,
    username: 'keisha',
    name: 'Keisha Medina',
    email: 'keisha@polchatresort.com',
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

  const login = async ({ identifier, password, roleOverride }) => {
    const cleanId = (identifier || '').trim().toLowerCase()
    let found = DEFAULT_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    )

    if (!found) {
      const isNamedAdmin = cleanId.includes('admin') || roleOverride === 'admin'
      found = {
        id: null,
        username: cleanId.split('@')[0],
        name: isNamedAdmin ? 'Admin User' : cleanId.split('@')[0],
        email: cleanId.includes('@') ? cleanId : `${cleanId}@polchat.com`,
        birthday: '1995-01-01',
        phone: '09170000000',
        role: isNamedAdmin ? 'admin' : 'customer',
      }
    } else if (roleOverride) {
      found = { ...found, role: roleOverride }
    }

    // If customer, ensure they are registered in Supabase customer_accounts and have a valid customer_id
    if (found.role === 'customer') {
      const realCustomerId = await DataService.ensureCustomer({
        customerId: found.id,
        customerName: found.name,
        phone: Number(found.phone.replace(/\D/g, '')) || 9171234567,
      })
      found.id = realCustomerId
    }

    setUser(found)
    setIsAuthModalOpen(false)
    return { success: true, user: found }
  }

  const signup = async ({ username, birthday, email, password, role = 'customer' }) => {
    const isNamedAdmin = username.toLowerCase().includes('admin') || role === 'admin'
    const nameParts = username.trim().split(' ')

    let customerId = null
    if (!isNamedAdmin) {
      // Create directly in Supabase customer_accounts
      const created = await DataService.addCustomer({
        first_name: nameParts[0] || username.trim(),
        last_name: nameParts.slice(1).join(' ') || '',
        phone_number: 9171234567,
      })
      customerId = created ? created.customer_id : 1
    }

    const newUser = {
      id: customerId || (isNamedAdmin ? 999 : 1),
      username: username.trim(),
      name: username.trim(),
      email: email.trim(),
      birthday: birthday,
      phone: '09171234567',
      role: isNamedAdmin ? 'admin' : 'customer',
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
