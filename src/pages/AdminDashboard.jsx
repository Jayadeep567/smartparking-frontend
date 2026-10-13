import { useEffect, useState } from 'react'
import api from '../api'

const fmt = s => new Date(s).toLocaleString()

export default function AdminDashboard() {
  const [tab, setTab] = useState('bookings')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [slotNo, setSlotNo] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    const [s, u, b] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/bookings')])
    setStats(s.data); setUsers(u.data); setBookings(b.data)
  }
  useEffect(() => { load() }, [])

  const addSlot = async () => {
    try { await api.post('/admin/slots', { slotNumber: slotNo }); setSlotNo(''); setMsg('Slot added'); load() }
    catch (ex) { setMsg(ex.response?.data?.message || 'Failed') }
  }
  const cancel = async id => { await api.delete(`/admin/bookings/${id}`); load() }

  return (
    <>
      <section className="stats">
        <div className="card stat"><b>{stats.users}</b>Users</div>
        <div className="card stat"><b>{stats.slots}</b>Slots</div>
        <div className="card stat"><b>{stats.bookings}</b>Bookings</div>
        <div className="card stat"><b>₹{stats.revenue}</b>Revenue</div>
      </section>

      <div className="tabs">
        {['bookings', 'users', 'slots'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === 'users' && (
        <section className="card"><h3>Registered users</h3>
          <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>{users.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>)}</tbody></table>
        </section>
      )}

      {tab === 'bookings' && (
        <section className="card"><h3>All bookings</h3>
          <table><thead><tr><th>User</th><th>Slot</th><th>Vehicle</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>{bookings.map(b => (
              <tr key={b.id}><td>{b.user.name}<br /><small>{b.user.email}</small></td><td>{b.slot.slotNumber}</td><td>{b.vehicleNumber}</td>
                <td>{fmt(b.startTime)}</td><td>{fmt(b.endTime)}</td><td>₹{b.amount}</td><td>{b.status}</td>
                <td>{b.status === 'ACTIVE' && <button className="danger" onClick={() => cancel(b.id)}>Cancel</button>}</td></tr>
            ))}</tbody></table>
        </section>
      )}

      {tab === 'slots' && (
        <section className="card"><h3>Add parking slot</h3>
          <div className="row"><input placeholder="Slot number e.g. B-01" value={slotNo} onChange={e => setSlotNo(e.target.value)} />
            <button onClick={addSlot}>Add</button></div>
          {msg && <p>{msg}</p>}
        </section>
      )}
    </>
  )
}
