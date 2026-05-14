import { useEffect, useState } from 'react';
import API from '../services/api';

const groupBookings = (bookings = []) => {
  const groups = new Map();

  bookings.forEach((booking) => {
    const key =
      booking.groupId ||
      [
        booking.studentId?._id || booking.studentId || 'student',
        booking.seatId?._id || booking.seatId || 'seat',
        booking.bookingDate || 'date',
        booking.createdAt || booking._id
      ].join('-');

    if (!groups.has(key)) {
      groups.set(key, {
        ...booking,
        groupKey: key,
        bookings: [],
        shifts: [],
        totalAmount: 0
      });
    }

    const group = groups.get(key);
    group.bookings.push(booking);
    group.shifts.push(booking.shiftId?.shiftName || 'Shift');
    group.totalAmount += Number(booking.paymentAmount) || Number(booking.shiftId?.price) || 0;

    if (booking.paymentId?.status === 'paid') {
      group.paymentId = booking.paymentId;
    }
  });

  return [...groups.values()];
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeBookings = groupBookings(bookings.filter(b => b.status === 'booked'));

  return (
    <div style={{ padding: 20 }}>
      <h2>Bookings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table width="100%" border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Student</th>
              <th>Seat</th>
              <th>Shift</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {activeBookings.map(b => (
              <tr key={b.groupKey}>
                <td>
                  {b.studentId?.name || '-'}
                  {b.status === 'cancelled' && (
                    <span style={{ marginLeft: 8, color: 'gray', fontSize: 12 }}>
                      (Cancelled)
                    </span>
                  )}
                </td>
                <td>{b.seatId?.seatNo}</td>
                <td>{b.shifts.join(', ')}</td>
                <td>{b.bookingDate || '-'}</td>
                <td>₹{b.totalAmount}</td>
                <td>{b.status}</td>
                <td>
                  {b.paymentId?.status === 'paid'
                    ? 'Paid'
                    : b.paymentId?.status === 'cancelled'
                    ? 'Cancelled'
                    : 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bookings;
