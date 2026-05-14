import { useEffect, useState } from 'react';
import { getSeatsByShift } from '../services/api';

const SeatGrid = ({ shiftId, date, onSelect }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shiftId) return;

    setLoading(true);

    getSeatsByShift(shiftId, date)
      .then(res => {
        setSeats(res.data.data || []);
      })
      .catch(() => {
        setSeats([]);
      })
      .finally(() => setLoading(false));

  }, [shiftId, date]);

  if (loading) return <p>Loading seats...</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Seat Layout</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 45px)',
          gap: 10
        }}
      >
        {seats.map(seat => {
          let bg = '#4caf50'; // available

          if (!seat.isAvailable) bg = '#f44336';
          if (seat.status === 'girls_only') bg = '#e91e63';

          return (
            <div
              key={seat._id}
              onClick={() => seat.isAvailable && onSelect(seat)}
              style={{
                height: 40,
                background: bg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                cursor: seat.isAvailable ? 'pointer' : 'not-allowed',
                opacity: seat.isAvailable ? 1 : 0.5
              }}
            >
              {seat.seatNo}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        🟢 Available &nbsp; 🔴 Booked &nbsp; 🩷 Girls Only
      </div>
    </div>
  );
};

export default SeatGrid;






