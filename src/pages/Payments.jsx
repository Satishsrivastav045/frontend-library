import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const getWhatsappPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

const openWhatsappReminder = (bookingGroup, bill) => {
  const phone = getWhatsappPhone(bookingGroup.studentId?.phoneNumber);

  if (!phone) {
    alert('Student mobile number not found');
    return;
  }

  const studentName = bookingGroup.studentId?.name || 'Student';
  const message = [
    `Namaste ${studentName},`,
    `Aapki library fee due hai: ${formatCurrency(bill?.totalPayable)}.`,
    `Seat: ${bookingGroup.seatId?.seatNo || '-'}`,
    `Shift: ${bookingGroup.shifts.join(', ')}`,
    `Date: ${bookingGroup.bookingDate || '-'}`,
    'Kripya payment complete kar dein. Dhanyavaad.'
  ].join('\n');

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

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
        currentAmount: 0
      });
    }

    const group = groups.get(key);
    group.bookings.push(booking);
    group.shifts.push(booking.shiftId?.shiftName || 'Shift');
    group.currentAmount += Number(booking.paymentAmount) || Number(booking.shiftId?.price) || 0;

    if (booking.paymentId?.status === 'paid') {
      group.paymentId = booking.paymentId;
    }
  });

  return [...groups.values()];
};

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch bookings with payment info
  const fetchBookings = async () => {
    try {
      const res = await API.get('/payments'); // 👈 bookings + payment populated
      setBookings(res.data.data || []);
    } catch {
      alert('Failed to load payments');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const bookingGroups = useMemo(() => groupBookings(bookings), [bookings]);

  const bookingBills = useMemo(() => {
    const sorted = [...bookingGroups].sort((left, right) => {
      const leftTime = new Date(left.bookingDate || left.createdAt || 0).getTime();
      const rightTime = new Date(right.bookingDate || right.createdAt || 0).getTime();
      if (leftTime !== rightTime) return leftTime - rightTime;
      return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
    });

    const outstandingByStudent = new Map();
    const bills = {};

    sorted.forEach((bookingGroup) => {
      const studentId = bookingGroup.studentId?._id || bookingGroup.studentId;
      const paid = bookingGroup.paymentId?.status === 'paid';
      const currentAmount = bookingGroup.currentAmount;
      const previousDue = outstandingByStudent.get(studentId) || 0;
      const totalPayable = previousDue + currentAmount;

      bills[bookingGroup.groupKey] = {
        currentAmount,
        previousDue,
        totalPayable
      };

      if (bookingGroup.status === 'cancelled' || paid) {
        outstandingByStudent.set(studentId, 0);
      } else {
        outstandingByStudent.set(studentId, totalPayable);
      }
    });

    return bills;
  }, [bookingGroups]);

  const selectedBill = selectedBooking ? bookingBills[selectedBooking.groupKey] : null;

  // 🔹 Create payment
  const submitPayment = async () => {
  try {
    setLoading(true);

    await API.post('/payments', {
      bookingId: selectedBooking.bookings[0]._id,
      method
    });


    alert('✅ Payment successful');
    setSelectedBooking(null);
    fetchBookings();

  } catch (err) {
    alert(err.response?.data?.message || 'Payment failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Payments</h2>

      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student</th>
            <th>Seat</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Reminder</th>
            </tr>
          </thead>

        <tbody>
          {bookingGroups.map(b => (
            <tr key={b.groupKey}>
              <td>{b.studentId?.name}</td>
              <td>{b.seatId?.seatNo}</td>
              <td>{b.shifts.join(', ')}</td>
              <td>
                {b.paymentId?.status === 'paid'
                  ? 'Paid'
                  : b.paymentId?.status === 'cancelled'
                  ? 'Cancelled'
                  : `Due (${formatCurrency(bookingBills[b.groupKey]?.totalPayable)})`}
              </td>
              <td>
                {b.paymentId?.status === 'paid' ? (
                  <span style={{ color: 'green' }}>
                    Paid {formatCurrency(b.paymentId?.amount)}
                  </span>
                ) : b.paymentId?.status === 'cancelled' ? (
                  <span style={{ color: 'gray' }}>Cancelled</span>
                ) : (
                  <button onClick={() => setSelectedBooking(b)}>
                    Pay {formatCurrency(bookingBills[b.groupKey]?.totalPayable)}
                  </button>
                )}
              </td>
              <td>
                {!b.paymentId && b.status !== 'cancelled' ? (
                  <button
                    type="button"
                    onClick={() => openWhatsappReminder(b, bookingBills[b.groupKey])}
                  >
                    WhatsApp
                  </button>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 PAYMENT MODAL */}
      {selectedBooking && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Confirm Payment</h3>

            <p><b>Student:</b> {selectedBooking.studentId.name}</p>
            <p><b>Seat:</b> {selectedBooking.seatId.seatNo}</p>
            <p><b>Shift:</b> {selectedBooking.shifts.join(', ')}</p>
            <p><b>Current Fee:</b> {formatCurrency(selectedBill?.currentAmount)}</p>
            <p><b>Previous Due:</b> {formatCurrency(selectedBill?.previousDue)}</p>
            <p><b>Total Payable:</b> {formatCurrency(selectedBill?.totalPayable)}</p>

            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>

            <div style={{ marginTop: 15 }}>
              <button onClick={submitPayment} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modal = {
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  width: 320
};

export default Payments;
