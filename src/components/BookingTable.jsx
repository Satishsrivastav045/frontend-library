import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { markPaymentPaidThunk } from '../redux/slices/dashboardSlice';

const BookingTable = ({ bookings = [] }) => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 🔍 SEARCH FILTER
  const filtered = bookings.filter(b =>
    b.seatId?.seatNo?.toLowerCase().includes(search.toLowerCase()) ||
    b.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.studentId?.phoneNumber?.includes(search)
  );

  // 📄 PAGINATION
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div style={{ marginTop: 40 }}>
      {/* 🔍 SEARCH BOX */}
      <input
        type="text"
        placeholder="Search seat / student / phone"
        autoComplete="off"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setPage(1); // reset page on search
        }}
        style={{
          marginBottom: 10,
          padding: 6,
          width: 250
        }}
      />

      {/* 📋 TABLE */}
      <table
        border="1"
        width="100%"
        cellPadding="8"
        style={{ borderCollapse: 'collapse' }}
      >
        <thead style={{ background: '#f3f4f6' }}>
          <tr>
            <th>Seat</th>
            <th>Student</th>
            <th>Phone</th>
            <th>Shift</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan="6" align="center">
                No bookings found
              </td>
            </tr>
          ) : (
            paginated.map(b => (
              <tr key={b._id}>
                <td>{b.seatId?.seatNo || '-'}</td>
                <td>{b.studentId?.name || '-'}</td>
                <td>{b.studentId?.phoneNumber || '-'}</td>
                <td>{b.shiftId?.shiftName || '-'}</td>

                {/* 💰 PAYMENT */}
                <td>
                  {b.paymentId ? (
                    b.paymentId.status === 'paid' ? (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>
                        Paid ₹{b.paymentId.amount}
                      </span>
                    ) : b.paymentId.status === 'cancelled' ? (
                      <span style={{ color: 'gray', fontWeight: 'bold' }}>
                        Cancelled
                      </span>
                    ) : (
                      <>
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>
                          Due ₹{b.paymentId.amount}
                        </span>
                        <br />
                        <button
                          style={{
                            marginTop: 5,
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                          onClick={() =>
                            dispatch(markPaymentPaidThunk(b.paymentId._id))
                          }
                        >
                          Mark Paid
                        </button>
                      </>
                    )
                  ) : (
                    <span style={{ color: 'gray' }}>N/A</span>
                  )}
                </td>

                {/* 📌 STATUS */}
                <td>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color:
                        b.status === 'booked'
                          ? 'blue'
                          : b.status === 'cancelled'
                          ? 'gray'
                          : 'black'
                    }}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ⏮️ PAGINATION BUTTONS */}
      <div style={{ marginTop: 10 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <button
          disabled={start + limit >= filtered.length}
          onClick={() => setPage(page + 1)}
          style={{ marginLeft: 10 }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingTable;
