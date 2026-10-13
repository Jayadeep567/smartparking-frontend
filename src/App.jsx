import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

const role = () => localStorage.getItem('role')

function Guard({ need, children }) {
  if (!localStorage.getItem('token')) return <Navigate to="/login" />
  if (need && role() !== need) return <Navigate to={role() === 'ADMIN' ? '/admin' : '/'} />
  return children
}

export default function App() {
  const nav = useNavigate()
  const logout = () => { localStorage.clear(); nav('/login') }
  const loggedIn = !!localStorage.getItem('token')
  return (
    <>
      <header className="nav">
        <h2>🅿️ Smart Parking</h2>
        <nav>
          {loggedIn ? (<><span>Hi, {localStorage.getItem('name')}</span><button onClick={logout}>Logout</button></>)
                    : (<><Link to="/login">Login</Link><Link to="/register">Register</Link></>)}
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Guard need="USER"><UserDashboard /></Guard>} />
          <Route path="/admin" element={<Guard need="ADMIN"><AdminDashboard /></Guard>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  )
}
