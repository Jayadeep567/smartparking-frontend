import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const submit = async e => {
    e.preventDefault(); setErr('')
    try { await api.post('/auth/register', f); alert('Registered! Please login.'); nav('/login') }
    catch (ex) { setErr(ex.response?.data?.message || 'Check your details (password min 6 chars)') }
  }
  return (
    <form className="card narrow" onSubmit={submit}>
      <h3>Create account</h3>
      {err && <p className="error">{err}</p>}
      <input placeholder="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <input placeholder="Email" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <input placeholder="Password (min 6)" type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <button>Register</button>
      <p>Have an account? <Link to="/login">Login</Link></p>
    </form>
  )
}
