import { useEffect, useState } from 'react'
import api from '../api'

const pad = n => String(n).padStart(2, '0')
const toLocal = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const fmt = s => new Date(s).toLocaleString()

export default function UserDashboard() {
  const now = new Date()
  const [start, setStart] = useState(toLocal(new Date(now.getTime() + 3600000)))
  const [end, setEnd] = useState(toLocal(new Date(now.getTime() + 3 * 3600000)))
  const [slots, setSlots] = useState([])
  const [selected, setSelected] = useState(null)
  const [vehicle, setVehicle] = useState('')
  const [mine, setMine] = useState([])
  const [msg, setMsg] = useState({ type: '', text: '' })

  const loadSlots = async () => {
    try { const { data } = await api.get('/slots', { params: { start: start + ':00', end: end + ':00' } }); setSlots(data); setSelected(null) }
    catch { setMsg({ type: 'error', text: 'Could not load slots' }) }
  }
  const loadMine = async () => { const { data } = await api.get('/bookings/my'); setMine(data) }
  useEffect(() => { loadSlots() }, [start, end])
  useEffect(() => { loadMine() }, [])

  const book = async () => {
    if (!selected || !vehicle.trim()) return setMsg({ type: 'error', text: 'Select a slot and enter vehicle number' })
    try {
      await api.post('/bookings', { slotId: selected, vehicleNumber: vehicle, startTime: start + ':00', endTime: end + ':00' })
      setMsg({ type: 'ok', text: 'Slot booked successfully!' }); setVehicle(''); loadSlots(); loadMine()
    } catch (ex) { setMsg({ type: 'error', text: ex.response?.data?.message || 'Booking failed' }) }
  }
  const cancel = async id => { await api.delete(`/bookings/${id}`); loadSlots(); loadMine() }

  return (
    <>
      <section className="card">
        <h3>Book a parking slot</h3>
        <div className="row">
          <label>From <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} /></label>
          <label>To <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} /></label>
        </div>
        <div className="grid">
          {slots.map(s => (
            <button key={s.id} disabled={!s.available}
              className={`slot ${s.available ? 'free' : 'busy'} ${selected === s.id ? 'sel' : ''}`}
              onClick={() => setSelected(s.id)}>{s.slotNumber}<small>{s.available ? 'Free' : 'Booked'}</small></button>
          ))}
        </div>
        <div className="row">
          <input placeholder="Vehicle number e.g. TS09AB1234" value={vehicle} onChange={e => setVehicle(e.target.value)} />
          <button onClick={book}>Book slot (₹20/hour)</button>
        </div>
        {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'error'}>{msg.text}</p>}
      </section>

      <section className="card">
        <h3>My bookings</h3>
        <table>
          <thead><tr><th>Slot</th><th>Vehicle</th><th>From</th><th>To</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {mine.map(b => (
              <tr key={b.id}><td>{b.slot.slotNumber}</td><td>{b.vehicleNumber}</td><td>{fmt(b.startTime)}</td><td>{fmt(b.endTime)}</td>
                <td>₹{b.amount}</td><td>{b.status}</td>
                <td>{b.status === 'ACTIVE' && <button className="danger" onClick={() => cancel(b.id)}>Cancel</button>}</td></tr>
            ))}
            {mine.length === 0 && <tr><td colSpan="7">No bookings yet</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  )
}
