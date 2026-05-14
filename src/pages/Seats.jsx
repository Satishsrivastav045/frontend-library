import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';

const today = () => new Date().toISOString().slice(0, 10);

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [bookingDate, setBookingDate] = useState(today());
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    row: 'A',
    startColumn: 1,
    totalSeats: 20,
    status: 'available'
  });

  const loadSeats = async () => {
    try {
      setLoading(true);
      const [seatsRes, bookingsRes, shiftsRes] = await Promise.all([
        API.get('/seats'),
        API.get('/bookings'),
        API.get('/shifts')
      ]);

      setSeats(seatsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setShifts(shiftsRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
  }, []);

  const bulkCreate = async () => {
    try {
      await API.post('/seats/bulk', form);
      alert('Seats created');
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/seats/${id}`, { status });
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const deleteSeat = async (id) => {
    if (!window.confirm('Delete this seat?')) return;
    try {
      await API.delete(`/seats/${id}`);
      loadSeats();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const bookingsBySeat = useMemo(() => {
    const grouped = {};

    bookings.forEach((booking) => {
      if (booking.status !== 'booked' || !booking.seatId) return;
      if (bookingDate && booking.bookingDate !== bookingDate) return;

      const seatId = booking.seatId?._id || booking.seatId;
      if (!grouped[seatId]) grouped[seatId] = [];
      grouped[seatId].push(booking);
    });

    return grouped;
  }, [bookings, bookingDate]);

  const getSeatBookings = (seatId) => bookingsBySeat[seatId] || [];

  const getSeatBookingStatus = (seat) => {
    const seatBookings = getSeatBookings(seat._id);

    if (seat.status === 'maintenance') return 'maintenance';
    if (seat.status === 'blocked') return 'blocked';
    if (seatBookings.length === 0) return seat.status;
    if (shifts.length > 0 && seatBookings.length >= shifts.length) return 'full_day_booked';
    return 'partially_booked';
  };

  const formatStatus = (status) => ({
    available: 'available',
    girls_only: 'girls_only',
    maintenance: 'maintenance',
    blocked: 'blocked',
    partially_booked: 'part booked',
    full_day_booked: 'full day'
  }[status] || status);

  return (
    <div style={{ padding: 20 }}>
      <h2>Seat Management</h2>

      {/* BULK CREATE */}
      <div style={box}>
        <input
          autoComplete="off"
          placeholder="Row"
          value={form.row}
          onChange={e => setForm({ ...form, row: e.target.value })}
        />

        <input
          type="number"
          autoComplete="off"
          placeholder="Start Column"
          value={form.startColumn}
          onChange={e => setForm({ ...form, startColumn: e.target.value })}
        />

        <input
          type="number"
          autoComplete="off"
          placeholder="Total Seats"
          value={form.totalSeats}
          onChange={e => setForm({ ...form, totalSeats: e.target.value })}
        />

        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
        >
          <option value="available">Available</option>
          <option value="girls_only">Girls Only</option>
          <option value="maintenance">Maintenance</option>
          <option value="blocked">Blocked</option>
        </select>

        <button onClick={bulkCreate}>Create Seats</button>
      </div>

      <div style={filterBox}>
        <label style={filterLabel}>
          Booking Date
          <input
            type="date"
            value={bookingDate}
            onChange={e => setBookingDate(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => setBookingDate('')}>
          Show All Dates
        </button>
        <button type="button" onClick={() => setBookingDate(today())}>
          Today
        </button>
      </div>

      {/* TABLE */}
      {loading ? <p>Loading...</p> : (
        <table style={table}>
          <thead>
            <tr>
              <th>Seat</th>
              <th>Row</th>
              <th>Column</th>
              <th>Status</th>
              <th>Booked Shifts</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {seats.map(seat => {
              const seatBookings = getSeatBookings(seat._id);
              const bookingStatus = getSeatBookingStatus(seat);

              return (
                <tr key={seat._id} style={rowStyle}>
                  <td>{seat.seatNo}</td>
                  <td>{seat.row}</td>
                  <td>{seat.column}</td>
                  <td>
                    <span style={badge(bookingStatus)}>
                      {formatStatus(bookingStatus)}
                    </span>
                    {seat.status !== 'available' && (
                      <span style={baseStatus}>Base: {seat.status}</span>
                    )}
                  </td>
                  <td>
                    {seatBookings.length > 0 ? (
                      <div style={shiftList}>
                        {seatBookings.map((booking) => (
                          <span key={booking._id} style={shiftChip}>
                            {booking.shiftId?.shiftName || 'Shift'}
                            {booking.studentId?.name ? ` - ${booking.studentId.name}` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={emptyText}>No booking</span>
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={seat.status}
                      onChange={e => updateStatus(seat._id, e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="girls_only">Girls Only</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <button
                      style={deleteBtn}
                      onClick={() => deleteSeat(seat._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* 🎨 STYLES */
const box = {
  display: 'flex',
  gap: 10,
  padding: 15,
  border: '1px solid #ddd',
  borderRadius: 10,
  marginBottom: 20
};

const filterBox = {
  display: 'flex',
  alignItems: 'end',
  gap: 10,
  marginBottom: 16,
  flexWrap: 'wrap'
};

const filterLabel = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontWeight: 600
};

const table = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 10px'
};

const rowStyle = {
  background: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  borderRadius: 8
};

const badge = (status) => ({
  padding: '6px 12px',
  borderRadius: 20,
  color: '#fff',
  fontSize: 13,
  background:
    status === 'available' ? '#22c55e' :
    status === 'girls_only' ? '#ec4899' :
    status === 'maintenance' ? '#f59e0b' :
    status === 'blocked' ? '#6b7280' :
    status === 'partially_booked' ? '#2563eb' :
    status === 'full_day_booked' ? '#7c3aed' :
    '#2563eb' // booked
});

const baseStatus = {
  display: 'block',
  marginTop: 6,
  color: '#6b7280',
  fontSize: 12
};

const shiftList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6
};

const shiftChip = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '5px 9px',
  color: '#1f2937',
  background: '#dbeafe',
  border: '1px solid #bfdbfe',
  fontSize: 12,
  fontWeight: 600
};

const emptyText = {
  color: '#9ca3af',
  fontSize: 13
};

const deleteBtn = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer'
};

export default Seats;
