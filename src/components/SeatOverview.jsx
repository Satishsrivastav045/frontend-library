const SeatOverview = ({
  shifts = [],
  shiftId,
  total,
  booked,
  available,
  onShiftChange,
  bookingDate,
  onDateChange
}) => {
  return (
    <div
      style={{
        marginTop: 20,
        border: '1px solid #ccc',
        padding: 15,
        borderRadius: 8
      }}
    >
      {/* 🔹 SHIFT + DATE */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <select
          value={shiftId}
          onChange={e => onShiftChange(e.target.value)}
        >
          <option value="">Select Shift</option>
          {shifts.map(shift => (
            <option key={shift._id} value={shift._id}>
              {shift.shiftName}
            </option>
          ))}
        </select>

        {/* ✅ DATE (OPTIONAL FILTER) */}
        <input
          type="date"
          autoComplete="off"
          value={bookingDate}
          onChange={e => onDateChange(e.target.value)}
        />

        {/* ✅ CLEAR DATE = OVERALL MODE */}
        {bookingDate && (
          <button onClick={() => onDateChange('')}>
            Clear
          </button>
        )}
      </div>

      {/* 🔹 COUNTS */}
      <div style={{ marginTop: 10 }}>
        <strong>Total:</strong> {total} |{' '}
        <strong>Booked:</strong> {booked} |{' '}
        <strong>Available:</strong> {available}
      </div>
    </div>
  );
};

export default SeatOverview;

