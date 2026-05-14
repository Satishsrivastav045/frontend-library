import { useState } from 'react';
import ShiftSelector from '../components/ShiftSelector';
import SeatGrid from '../components/SeatGrid';

const ShiftSeatBooking = () => {
  const [shiftId, setShiftId] = useState('');
  const [date, setDate] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h2>Book Seat</h2>

      {/* 🔹 SHIFT */}
      <ShiftSelector value={shiftId} onChange={setShiftId} />

      {/* 🔹 DATE */}
      <input
        type="date"
        autoComplete="off"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      {/* 🔹 SEAT GRID */}
      {shiftId && date && (
        <SeatGrid
          shiftId={shiftId}
          date={date}
          onSelect={seat => setSelectedSeat(seat)}
        />
      )}

      {/* 🔹 SELECTED SEAT */}
      {selectedSeat && (
        <div style={{ marginTop: 20 }}>
          <h4>Selected Seat: {selectedSeat.seatNo}</h4>
        </div>
      )}
    </div>
  );
};

export default ShiftSeatBooking;
