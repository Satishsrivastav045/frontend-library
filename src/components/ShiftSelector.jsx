import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShifts } from '../redux/slices/shiftSlice';

const ShiftSelector = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const { shifts } = useSelector(state => state.shift);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">-- Select Shift --</option>
      {shifts.map(s => (
        <option key={s._id} value={s._id}>
          {s.shiftName} ({s.startTime}-{s.endTime}) ₹{s.price}
        </option>
      ))}
    </select>
  );
};

export default ShiftSelector;
