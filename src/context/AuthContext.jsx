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
    id: 101,
    username: 'juandelacruz',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@gmail.com',
    password: 'customer123',
    birthday: '1995-06-12',
    phone: '09171234567',
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
        id: Date.now(),
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

    setUser(found)
    setIsAuthModalOpen(false)
    return { success: true, user: found }
  }

  const signup = async ({ username, birthday, email, password, role = 'customer' }) => {
    const isNamedAdmin = username.toLowerCase().includes('admin') || role === 'admin'
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      name: username.trim(),
      email: email.trim(),
      birthday: birthday,
      phone: '09170000000',
      role: isNamedAdmin ? 'admin' : 'customer',
    }

    // Register in DataService customer catalog if customer
    if (newUser.role === 'customer') {
      await DataService.addCustomer({
        customer_id: newUser.id,
        first_name: newUser.name,
        last_name: '',
        phone_number: 9170000000,
        email: newUser.email,
      })
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
