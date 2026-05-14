import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchShifts,
  createShiftThunk,
  updateShiftThunk,
  deactivateShiftThunk,
  deleteShiftThunk
} from '../redux/slices/shiftSlice';

const Shifts = () => {
  const dispatch = useDispatch();
  const { shifts } = useSelector(state => state.shift);
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    shiftName: '',
    startTime: '',
    endTime: '',
    price: ''
  });

  const [editId, setEditId] = useState(null);

  /* ======================
     FETCH SHIFTS
  ====================== */
  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;

    API.get('/bookings')
      .then((res) => {
        if (!mounted) return;
        setBookings(res.data.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setBookings([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const studentCountByShift = useMemo(() => {
    const counts = {};

    bookings
      .filter((booking) => booking.status === 'booked')
      .forEach((booking) => {
        const shiftId = booking.shiftId?._id || booking.shiftId;
        const studentId = booking.studentId?._id || booking.studentId;

        if (!shiftId || !studentId) return;

        if (!counts[shiftId]) {
          counts[shiftId] = new Set();
        }

        counts[shiftId].add(studentId);
      });

    return counts;
  }, [bookings]);

  /* ======================
     SUBMIT (ADD / UPDATE)
  ====================== */
  const submit = () => {
    if (!form.shiftName || !form.startTime || !form.endTime || !form.price) {
      alert('All fields required');
      return;
    }

    if (form.startTime >= form.endTime) {
      alert('Start time must be before end time');
      return;
    }

    const payload = {
      shiftName: form.shiftName,
      startTime: form.startTime,
      endTime: form.endTime,
      price: Number(form.price)
    };

    if (editId) {
      dispatch(updateShiftThunk({ id: editId, data: payload }));
      setEditId(null);
    } else {
      dispatch(createShiftThunk(payload));
    }

    setForm({
      shiftName: '',
      startTime: '',
      endTime: '',
      price: ''
    });
  };

  /* ======================
     DELETE SHIFT
  ====================== */
  const remove = (id) => {
    if (!window.confirm('Delete shift permanently?')) return;

    dispatch(deleteShiftThunk(id))
      .unwrap()
      .catch(msg => alert(msg));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Shifts</h2>

      {/* ======================
          FORM
      ====================== */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Shift Name"
          autoComplete="off"
          value={form.shiftName}
          onChange={e => setForm({ ...form, shiftName: e.target.value })}
        />

        <input
          type="time"
          autoComplete="off"
          value={form.startTime}
          onChange={e => setForm({ ...form, startTime: e.target.value })}
        />

        <input
          type="time"
          autoComplete="off"
          value={form.endTime}
          onChange={e => setForm({ ...form, endTime: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          autoComplete="off"
          value={form.price}
          onChange={e =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />

        <button onClick={submit} style={{ marginLeft: 10 }}>
          {editId ? 'Update Shift' : 'Add Shift'}
        </button>
      </div>

      <hr />

      {/* ======================
          TABLE
      ====================== */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Time</th>
            <th>Price</th>
            <th>Student Count</th>
            <th>Status</th>
            <th width="220">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(s => (
            <tr key={s._id}>
              <td>{s.shiftName}</td>
              <td>{s.startTime} - {s.endTime}</td>
              <td>₹{s.price}</td>
              <td>{studentCountByShift[s._id]?.size || 0}</td>
              <td>{s.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button
                  onClick={() => {
                    setEditId(s._id);
                    setForm({
                      shiftName: s.shiftName,
                      startTime: s.startTime,
                      endTime: s.endTime,
                      price: s.price
                    });
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => dispatch(deactivateShiftThunk(s._id))}
                  disabled={!s.isActive}
                  style={{ marginLeft: 5 }}
                >
                  Deactivate
                </button>

                <button
                  onClick={() => remove(s._id)}
                  style={{ marginLeft: 5, color: 'red' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {shifts.length === 0 && (
            <tr>
              <td colSpan="6" align="center">
                No shifts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Shifts;
