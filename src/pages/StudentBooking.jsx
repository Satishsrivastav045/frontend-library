import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const today = () => new Date().toISOString().slice(0, 10);

const initialStudent = {
  studentId: '',
  name: '',
  gender: 'male',
  phoneNumber: '',
  email: '',
  idType: 'Aadhar Card',
  idNumber: '',
  address: '',
  fatherName: '',
  fatherPhoneNumber: ''
};

const initialBooking = {
  bookingType: 'single',
  shiftId: '',
  shiftIds: [],
  seatId: '',
  bookingDate: today()
};

const StudentBooking = () => {
  const [student, setStudent] = useState(initialStudent);
  const [studentRecordId, setStudentRecordId] = useState('');
  const [booking, setBooking] = useState(initialBooking);
  const [shifts, setShifts] = useState([]);
  const [seats, setSeats] = useState([]);
  const [shiftSummaries, setShiftSummaries] = useState({});
  const [studentSaving, setStudentSaving] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('student');
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  useEffect(() => {
    let alive = true;

    const loadShifts = async () => {
      try {
        const res = await API.get('/shifts');
        if (!alive) return;

        const data = res.data?.data || [];
        setShifts(data);

        if (data.length > 0) {
          setBooking((current) => ({
            ...current,
            shiftId: current.shiftId || data[0]._id,
            shiftIds: current.shiftIds.length > 0 ? current.shiftIds : [data[0]._id]
          }));
        }

        const summaryResults = await Promise.allSettled(
          data.map((shift) => API.get(`/seats/shift/${shift._id}`))
        );

        if (!alive) return;

        const nextSummaries = {};
        summaryResults.forEach((result, index) => {
          const shift = data[index];
          const seatsData =
            result.status === 'fulfilled' ? (result.value.data?.data || []) : [];
          const total = seatsData.length;
          const booked = seatsData.filter((seat) => !seat.isAvailable).length;

          nextSummaries[shift._id] = {
            total,
            booked,
            free: Math.max(total - booked, 0)
          };
        });

        setShiftSummaries(nextSummaries);
      } catch (error) {
        if (alive) {
          setShifts([]);
          setShiftSummaries({});
        }
      }
    };

    loadShifts();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const selectedShiftIds =
      booking.bookingType === 'single'
        ? booking.shiftId
          ? [booking.shiftId]
          : []
        : booking.bookingType === 'full-day'
        ? shifts.map((shift) => shift._id)
        : booking.shiftIds;

    if (selectedShiftIds.length === 0) {
      setSeats([]);
      return;
    }

    let alive = true;
    setLoadingSeats(true);

    Promise.all(
      selectedShiftIds.map((shiftId) =>
        API.get(`/seats/shift/${shiftId}?bookingDate=${booking.bookingDate}`)
      )
    )
      .then((responses) => {
        if (!alive) return;

        const [firstResponse, ...otherResponses] = responses;
        const firstSeats = firstResponse.data?.data || [];
        const otherSeatMaps = otherResponses.map((response) => {
          const map = new Map();
          (response.data?.data || []).forEach((seat) => map.set(seat._id, seat));
          return map;
        });

        const seatsAvailableInEveryShift = firstSeats.map((seat) => ({
          ...seat,
          isAvailable:
            seat.isAvailable &&
            otherSeatMaps.every((seatMap) => seatMap.get(seat._id)?.isAvailable)
        }));

        setSeats(seatsAvailableInEveryShift);
      })
      .catch(() => {
        if (!alive) return;
        setSeats([]);
      })
      .finally(() => {
        if (alive) setLoadingSeats(false);
      });

    return () => {
      alive = false;
    };
  }, [booking.bookingType, booking.shiftId, booking.shiftIds, booking.bookingDate, shifts]);

  const availableSeats = useMemo(
    () => seats.filter((seat) => seat.isAvailable),
    [seats]
  );

  const selectedShiftIds = useMemo(() => {
    if (booking.bookingType === 'single') {
      return booking.shiftId ? [booking.shiftId] : [];
    }

    if (booking.bookingType === 'full-day') {
      return shifts.map((shift) => shift._id);
    }

    return booking.shiftIds;
  }, [booking.bookingType, booking.shiftId, booking.shiftIds, shifts]);

  const selectedShifts = shifts.filter((shift) => selectedShiftIds.includes(shift._id));
  const selectedShift = shifts.find((shift) => shift._id === booking.shiftId);
  const selectedSeat = availableSeats.find((seat) => seat._id === booking.seatId);
  const selectedShiftStats = useMemo(() => {
    if (selectedShiftIds.length > 0 && seats.length > 0) {
      const free = seats.filter((seat) => seat.isAvailable).length;
      const total = seats.length;
      return {
        total,
        booked: Math.max(total - free, 0),
        free
      };
    }

    const cached = shiftSummaries[selectedShiftIds[0]];
    if (cached) {
      return cached;
    }

    const total = seats.length;
    const booked = seats.filter((seat) => !seat.isAvailable).length;

    return {
      total,
      booked,
      free: Math.max(total - booked, 0)
    };
  }, [selectedShiftIds, seats, shiftSummaries]);

  const formatShiftLabel = (shift) => {
    const summary = shiftSummaries[shift._id];
    if (!summary) {
      return shift.shiftName;
    }

    return `${shift.shiftName} - Free ${summary.free} / Booked ${summary.booked} / Total ${summary.total}`;
  };

  const updateStudent = (field) => (event) => {
    const { value } = event.target;
    setStudent((current) => ({ ...current, [field]: value }));
  };

  const updateBooking = (field) => (event) => {
    const { value } = event.target;
    setBooking((current) => ({
      ...current,
      [field]: value,
      ...(field === 'bookingType'
        ? {
            seatId: '',
            shiftId: shifts[0]?._id || '',
            shiftIds: shifts[0]?._id ? [shifts[0]._id] : []
          }
        : {}),
      ...(field === 'shiftId' ? { seatId: '', shiftIds: value ? [value] : [] } : {})
    }));
  };

  const toggleShift = (shiftId) => (event) => {
    const checked = event.target.checked;

    setBooking((current) => {
      const nextShiftIds = checked
        ? [...current.shiftIds, shiftId].slice(0, 2)
        : current.shiftIds.filter((id) => id !== shiftId);

      return {
        ...current,
        shiftIds: nextShiftIds,
        seatId: ''
      };
    });
  };

  const saveStudent = async (event) => {
    event.preventDefault();

    if (!student.name || !student.phoneNumber) {
      return alert('Name and Mobile No. are required');
    }

    try {
      setStudentSaving(true);

      const payload = {
        name: student.name,
        gender: student.gender,
        phoneNumber: student.phoneNumber,
        email: student.email,
        idType: 'Aadhar Card',
        idNumber: student.idNumber,
        address: student.address,
        fatherName: student.fatherName,
        fatherPhoneNumber: student.fatherPhoneNumber
      };

      const res = await API.post('/students', payload);
      const createdStudent = res.data?.data || {};
      setStudentRecordId(createdStudent._id || '');
      setStudent((current) => ({
        ...current,
        studentId: createdStudent.studentId || current.studentId
      }));
      setActiveSection('booking');
    } catch (error) {
      alert(error.response?.data?.message || 'Student create failed');
    } finally {
      setStudentSaving(false);
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();

    if (!studentRecordId) {
      return alert('Please save student details first');
    }

    if (!booking.seatId || !booking.bookingDate) {
      return alert('Select seat and booking date');
    }

    if (booking.bookingType === 'single' && !booking.shiftId) {
      return alert('Select shift');
    }

    if (booking.bookingType === 'multi' && booking.shiftIds.length !== 2) {
      return alert('Select exactly 2 shifts');
    }

    try {
      setBookingSaving(true);

      const basePayload = {
        studentId: studentRecordId,
        seatId: booking.seatId,
        bookingDate: booking.bookingDate
      };

      if (booking.bookingType === 'full-day') {
        await API.post('/bookings/full-day', basePayload);
      } else if (booking.bookingType === 'multi') {
        await API.post('/bookings/multi-shift', {
          ...basePayload,
          shiftIds: booking.shiftIds
        });
      } else {
        await API.post('/bookings', {
          ...basePayload,
          shiftId: booking.shiftId
        });
      }

      alert('Booking successful');

      setStudent(initialStudent);
      setStudentRecordId('');
      setBooking({
        ...initialBooking,
        shiftId: shifts[0]?._id || '',
        shiftIds: shifts[0]?._id ? [shifts[0]._id] : []
      });
      setSeats([]);
      setActiveSection('student');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingSaving(false);
    }
  };

  return (
    <div className="admission-page">
      <div className="admission-page__top">
        <div>
          <h1>Student Admission</h1>
          <p>First save the student, then select a shift and seat.</p>
        </div>

        <Link to="/dashboard" className="admission-page__back">
          Back to Dashboard
        </Link>
      </div>

      <div className="admission-workbench">
        <section
          className={`admission-panel ${
            activeSection === 'student' ? 'admission-panel--active' : ''
          }`}
        >
          <div className="admission-panel__title">
            <h2>Student Details</h2>
            <span>01</span>
          </div>

          <form className="admission-form" onSubmit={saveStudent}>
            <div className="admission-grid">
              <label className="admission-field">
                <span>Name</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={student.name}
                  onChange={updateStudent('name')}
                  placeholder="Enter student name"
                />
              </label>

              <label className="admission-field">
                <span>Mobile No.</span>
                <input
                  type="text"
                  autoComplete="tel"
                  value={student.phoneNumber}
                  onChange={updateStudent('phoneNumber')}
                  placeholder="10 digit mobile"
                />
              </label>

              <label className="admission-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={student.email}
                  onChange={updateStudent('email')}
                  placeholder="student@email.com"
                />
              </label>

              <label className="admission-field">
                <span>Gender</span>
                <select value={student.gender} onChange={updateStudent('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="admission-field">
                <span>Student ID</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={student.studentId}
                  readOnly
                  placeholder="Auto-generated on save"
                />
              </label>

              <div className="admission-field admission-field--wide">
                <div className="admission-field__row">
                  <span>Aadhaar Number</span>
                  <button
                    type="button"
                    className="admission-field__toggle"
                    onClick={() => setShowAadhaar((current) => !current)}
                  >
                    {showAadhaar ? 'Hide' : 'Show'} Aadhaar
                  </button>
                </div>

                {showAadhaar ? (
                  <input
                    type="text"
                    autoComplete="off"
                    value={student.idNumber}
                    onChange={updateStudent('idNumber')}
                    placeholder="Enter Aadhaar number"
                  />
                ) : (
                  <div className="admission-field__hidden">
                    Hidden for privacy. Admin can reveal it when needed.
                  </div>
                )}
              </div>

              <label className="admission-field">
                <span>Id No.</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={student.idNumber}
                  onChange={updateStudent('idNumber')}
                  placeholder="ID number"
                />
              </label>

              <label className="admission-field admission-field--wide">
                <span>Address</span>
                <input
                  type="text"
                  autoComplete="street-address"
                  value={student.address}
                  onChange={updateStudent('address')}
                  placeholder="Full address"
                />
              </label>

              <label className="admission-field">
                <span>Father's Name</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={student.fatherName}
                  onChange={updateStudent('fatherName')}
                  placeholder="Father name"
                />
              </label>

              <label className="admission-field">
                <span>Father's Mobile No.</span>
                <input
                  type="text"
                  autoComplete="tel"
                  value={student.fatherPhoneNumber}
                  onChange={updateStudent('fatherPhoneNumber')}
                  placeholder="Father mobile"
                />
              </label>
            </div>

            <div className="admission-actions">
              <button type="submit" className="admission-button" disabled={studentSaving}>
                {studentSaving ? 'Saving...' : 'Next'}
              </button>
            </div>
          </form>
        </section>

        <div className="admission-arrow" aria-hidden="true">
          →
        </div>

        <section
          className={`admission-panel admission-panel--booking ${
            activeSection === 'booking' ? 'admission-panel--active' : ''
          }`}
        >
          <div className="admission-panel__title">
            <h2>Booking</h2>
            <span>02</span>
          </div>

          <form className="booking-form" onSubmit={submitBooking}>
            <label className="admission-field">
              <span>Booking Type</span>
              <select
                autoComplete="off"
                value={booking.bookingType}
                onChange={updateBooking('bookingType')}
              >
                <option value="single">1 Shift</option>
                <option value="multi">2 Shifts</option>
                <option value="full-day">Full Day</option>
              </select>
            </label>

            {booking.bookingType === 'single' && (
              <label className="admission-field">
                <span>Shift</span>
                <select autoComplete="off" value={booking.shiftId} onChange={updateBooking('shiftId')}>
                  <option value="">Select shift</option>
                  {shifts.map((shift) => (
                    <option key={shift._id} value={shift._id}>
                      {formatShiftLabel(shift)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {booking.bookingType === 'multi' && (
              <div className="admission-field">
                <span>Select 2 Shifts</span>
                <div className="shift-choice-grid">
                  {shifts.map((shift) => {
                    const checked = booking.shiftIds.includes(shift._id);
                    const maxSelected = booking.shiftIds.length >= 2;

                    return (
                      <label key={shift._id} className="shift-choice">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && maxSelected}
                          onChange={toggleShift(shift._id)}
                        />
                        <span>{formatShiftLabel(shift)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {booking.bookingType === 'full-day' && (
              <label className="admission-field">
                <span>Shifts</span>
                <select autoComplete="off" value="all" disabled>
                  <option value="all">All active shifts ({shifts.length})</option>
                </select>
              </label>
            )}

            <div className="shift-summary">
              <div>
                <strong>Total</strong>
                <span>{selectedShiftIds.length > 0 ? selectedShiftStats.total : 0}</span>
              </div>
              <div>
                <strong>Booked</strong>
                <span>{selectedShiftIds.length > 0 ? selectedShiftStats.booked : 0}</span>
              </div>
              <div>
                <strong>Free</strong>
                <span>{selectedShiftIds.length > 0 ? selectedShiftStats.free : 0}</span>
              </div>
            </div>

            <label className="admission-field">
              <span>Seat</span>
              <select
                autoComplete="off"
                value={booking.seatId}
                onChange={updateBooking('seatId')}
                disabled={selectedShiftIds.length === 0 || loadingSeats}
              >
                <option value="">
                  {loadingSeats
                    ? 'Loading seats...'
                    : availableSeats.length > 0
                    ? 'Select seat'
                    : 'No seats available'}
                </option>
                {availableSeats.map((seat) => (
                  <option key={seat._id} value={seat._id}>
                    {seat.seatNo}
                  </option>
                ))}
              </select>
            </label>

            <label className="admission-field">
              <span>Booking Date</span>
              <input
                type="date"
                autoComplete="off"
                value={booking.bookingDate}
                onChange={updateBooking('bookingDate')}
              />
            </label>

            <div className="booking-summary">
              <div>
                <strong>Student</strong>
                <span>{student.name || 'Not saved yet'}</span>
              </div>
              <div>
                <strong>Shift</strong>
                <span>
                  {booking.bookingType === 'full-day'
                    ? `Full Day (${selectedShifts.length} shifts)`
                    : selectedShifts.map((shift) => shift.shiftName).join(', ') ||
                      selectedShift?.shiftName ||
                      'Not selected'}
                </span>
              </div>
              <div>
                <strong>Seat</strong>
                <span>{selectedSeat?.seatNo || 'Not selected'}</span>
              </div>
            </div>

            <div className="admission-actions admission-actions--right">
              <button type="submit" className="admission-button" disabled={bookingSaving}>
                {bookingSaving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default StudentBooking;
