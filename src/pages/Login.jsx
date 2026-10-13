import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const submit = async e => {
    e.preventDefault(); setErr('')
    try {
      const { data } = await api.post('/auth/login', f)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      nav(data.role === 'ADMIN' ? '/admin' : '/')
    } catch (ex) { setErr(ex.response?.data?.message || 'Login failed') }
  }
  return (
    <form className="card narrow" onSubmit={submit}>
      <h3>Login</h3>
      {err && <p className="error">{err}</p>}
      <input placeholder="Email" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <input placeholder="Password" type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <button>Login</button>
      <p>No account? <Link to="/register">Register</Link></p>
      <small>Demo admin: admin@parking.com / admin123</small>
    </form>
  )
}
