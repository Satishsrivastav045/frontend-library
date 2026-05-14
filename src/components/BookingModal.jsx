import { useEffect, useState } from 'react';
import API from '../services/api';

const BookingModal = ({ seat, shifts, onClose, onBooked }) => {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [bookingType, setBookingType] = useState('SINGLE');
  const [selectedShifts, setSelectedShifts] = useState([]);

  useEffect(() => {
    if (!seat) return;

    API.get('/students')
      .then(res => setStudents(res.data.data))
      .catch(() => {});
  }, [seat]);

  if (!seat) return null;

  const toggleShift = (id) => {
    setSelectedShifts(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (!studentId) return alert('Select student');

    onBooked({
      studentId,
      bookingType,
      shiftIds: selectedShifts
    });
  };

  return (
    <div style={overlay}>
      <div style={box}>
        <h3>Book Seat {seat.seatNo}</h3>

        {/* STUDENT */}
        <select
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          style={input}
        >
          <option value="">Select Student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentId})
            </option>
          ))}
        </select>

        {/* BOOKING TYPE */}
        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="radio"
              value="SINGLE"
              checked={bookingType === 'SINGLE'}
              onChange={() => setBookingType('SINGLE')}
            /> Single Shift
          </label>

          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              value="MULTI"
              checked={bookingType === 'MULTI'}
              onChange={() => setBookingType('MULTI')}
            /> Multi Shift
          </label>

          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              value="FULL"
              checked={bookingType === 'FULL'}
              onChange={() => setBookingType('FULL')}
            /> Full Day
          </label>
        </div>

        {/* SHIFT SELECTION */}
        {bookingType !== 'FULL' && (
          <div style={{ marginTop: 10 }}>
            {shifts.map(s => (
              <label key={s._id} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={selectedShifts.includes(s._id)}
                  onChange={() => toggleShift(s._id)}
                />
                {s.shiftName} ({s.startingTime} - {s.endingTime})
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: 15, textAlign: 'right' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm} style={btn}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const box = {
  background: '#fff',
  padding: 20,
  width: 380,
  borderRadius: 8
};

const input = {
  width: '100%',
  padding: 6
};

const btn = {
  marginLeft: 10,
  background: '#4caf50',
  color: '#fff',
  border: 'none',
  padding: '6px 12px',
  cursor: 'pointer'
};


