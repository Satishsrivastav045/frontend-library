import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const formatCompactCurrency = (value = 0) => {
  const number = Number(value) || 0;
  if (number === 0) return '₹0';

  return `₹${new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(number)}`;
};

const maskMobile = (phone = '') => {
  if (!phone) return '-';
  const text = String(phone);
  if (text.length <= 4) return text;
  return `${text.slice(0, 4)}****`;
};

const padSeat = (seatNo = '') => {
  if (seatNo === null || seatNo === undefined || seatNo === '') return '-';
  const text = String(seatNo);
  return text.length === 1 ? text.padStart(2, '0') : text;
};

const StatIcon = ({ type }) => {
  if (type === 'bookings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3v2H5.5A2.5 2.5 0 0 0 3 7.5v11A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 18.5 5H17V3h-2v2H9V3H7Zm11.5 7v8.5h-13V10h13ZM6.5 12h11v2h-11v-2Z" />
      </svg>
    );
  }

  if (type === 'seats') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7.5A3.5 3.5 0 0 1 9.5 4h5A3.5 3.5 0 0 1 18 7.5V13H6V7.5Zm12 7.5v3h1.5A1.5 1.5 0 0 1 21 19.5v1h-2v-1H5v1H3v-1A1.5 1.5 0 0 1 4.5 18H6v-3h12Z" />
      </svg>
    );
  }

  if (type === 'available') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m10 15.17 9.19-9.18 1.41 1.41L10 18 3.39 11.39l1.41-1.41L10 15.17Z" />
      </svg>
    );
  }

  if (type === 'dues') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7H6a2 2 0 0 1 0-4h11a1 1 0 0 0 0-2H6a4 4 0 0 0 0 8h14a1 1 0 0 1 1 1v1H6a4 4 0 0 0 0 8h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-1 10H6a2 2 0 0 1 0-4h13v4Zm-2-2.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 0 0-3 0Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 3h2v6h6v2h-6v6h-2v-6H5V9h6V3Z" />
    </svg>
  );
};

const BookingCard = ({ booking, bill }) => {
  const student = booking?.studentId || {};
  const payment = booking?.paymentId || {};
  const studentName = student?.name || student?.studentId || '-';
  const dueAmount = bill?.totalPayable || Number(booking?.paymentAmount) || Number(booking?.shiftId?.price) || 0;

  const feeLabel =
    payment.status === 'paid'
      ? 'Paid'
      : payment.status === 'cancelled'
      ? 'Cancelled'
      : `Due (${formatCurrency(dueAmount)})`;

  const feeClass =
    payment.status === 'paid'
      ? 'booking-table__paid'
      : payment.status === 'cancelled'
      ? 'booking-table__cancelled'
      : 'booking-table__due';

  return (
    <tr>
      <td>
        <div className="booking-student">
          <strong>{studentName}</strong>
          {student.studentId && student.name ? <span>{student.studentId}</span> : null}
        </div>
      </td>
      <td>{student.gender || '-'}</td>
      <td>{maskMobile(student.phoneNumber)}</td>
      <td>{padSeat(booking?.seatId?.seatNo)}</td>
      <td>{booking?.shiftId?.shiftName || '-'}</td>
      <td className={feeClass}>{feeLabel}</td>
    </tr>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSeats: 0,
    totalBookings: 0,
    availableSeats: 0
  });
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const [statsRes, bookingsRes, studentsRes, adminRes] = await Promise.allSettled([
          API.get('/dashboard'),
          API.get('/bookings'),
          API.get('/students'),
          API.get('/admin/me')
        ]);

        if (!mounted) return;

        setStats(
          statsRes.status === 'fulfilled' && statsRes.value?.data?.data
            ? statsRes.value.data.data
            : {
                totalSeats: 0,
                totalBookings: 0,
                availableSeats: 0
              }
        );
        setBookings(
          bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data?.data || []) : []
        );
        setStudents(
          studentsRes.status === 'fulfilled' ? (studentsRes.value.data?.data || []) : []
        );
        setAdmin(
          adminRes.status === 'fulfilled' ? (adminRes.value.data?.data || null) : null
        );
      } catch (error) {
        if (!mounted) return;
        setStats({
          totalSeats: 0,
          totalBookings: 0,
          availableSeats: 0
        });
        setAdmin(null);
        setBookings([]);
        setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const totalEarnings = useMemo(
    () =>
      bookings.reduce((sum, booking) => {
        const payment = booking?.paymentId;
        if (payment?.status === 'paid') {
          return sum + (Number(payment.amount) || 0);
        }
        return sum;
      }, 0),
    [bookings]
  );

  const totalDue = useMemo(() => {
    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.bookingDate || left.createdAt || 0).getTime();
      const rightTime = new Date(right.bookingDate || right.createdAt || 0).getTime();
      if (leftTime !== rightTime) return leftTime - rightTime;
      return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
    });

    const outstandingByStudent = new Map();

    sorted.forEach((booking) => {
      const studentId = booking?.studentId?._id || booking?.studentId;
      const payment = booking?.paymentId;
      const paid = payment?.status === 'paid';
      const currentAmount = Number(booking?.paymentAmount) || Number(booking?.shiftId?.price) || 0;
      const previousDue = outstandingByStudent.get(studentId) || 0;
      const totalPayable = previousDue + currentAmount;

      if (booking.status === 'cancelled' || paid) {
        outstandingByStudent.set(studentId, 0);
      } else {
        outstandingByStudent.set(studentId, totalPayable);
      }
    });

    return Array.from(outstandingByStudent.values()).reduce((sum, amount) => sum + amount, 0);
  }, [bookings]);

  const studentBreakdown = useMemo(() => {
    const base = {
      male: 0,
      female: 0,
      others: 0
    };

    (students || []).forEach((student) => {
      const gender = String(student?.gender || '').toLowerCase();

      if (gender === 'male') {
        base.male += 1;
      } else if (gender === 'female') {
        base.female += 1;
      } else {
        base.others += 1;
      }
    });

    return {
      total: base.male + base.female + base.others,
      ...base
    };
  }, [students]);

  const studentSegments = useMemo(
    () => [
      { key: 'male', label: 'Male', value: studentBreakdown.male, color: '#6e86c9' },
      { key: 'female', label: 'Female', value: studentBreakdown.female, color: '#e28daf' },
      { key: 'others', label: 'Others', value: studentBreakdown.others, color: '#d9a15f' }
    ],
    [studentBreakdown]
  );

  const studentPieGradient = useMemo(() => {
    const total = studentBreakdown.total;
    if (!total) {
      return 'conic-gradient(#d6dae5 0deg 360deg)';
    }

    let start = 0;
    return studentSegments
      .map((segment) => {
        const slice = (segment.value / total) * 360;
        const end = start + slice;
        const part = `${segment.color} ${start}deg ${end}deg`;
        start = end;
        return part;
      })
      .join(', ');
  }, [studentBreakdown.total, studentSegments]);

  const currentYear = new Date().getFullYear();

  const monthlyEarnings = useMemo(() => {
    const months = Array(12).fill(0);

    (bookings || []).forEach((booking) => {
      const payment = booking?.paymentId;
      if (payment?.status !== 'paid') return;

      const paidAt = payment?.createdAt || booking?.createdAt;
      if (!paidAt) return;

      const paidDate = new Date(paidAt);
      if (Number.isNaN(paidDate.getTime())) return;
      if (paidDate.getFullYear() !== currentYear) return;

      months[paidDate.getMonth()] += Number(payment.amount) || 0;
    });

    return months;
  }, [bookings, currentYear]);

  const yearlyEarnings = useMemo(
    () => monthlyEarnings.reduce((sum, amount) => sum + amount, 0),
    [monthlyEarnings]
  );

  const bookingBills = useMemo(() => {
    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.bookingDate || left.createdAt || 0).getTime();
      const rightTime = new Date(right.bookingDate || right.createdAt || 0).getTime();
      if (leftTime !== rightTime) return leftTime - rightTime;
      return new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime();
    });

    const outstandingByStudent = new Map();
    const bills = {};

    sorted.forEach((booking) => {
      const studentId = booking?.studentId?._id || booking?.studentId;
      const payment = booking?.paymentId;
      const paid = payment?.status === 'paid';
      const currentAmount = Number(booking?.paymentAmount) || Number(booking?.shiftId?.price) || 0;
      const previousDue = outstandingByStudent.get(studentId) || 0;
      const totalPayable = previousDue + currentAmount;

      bills[booking._id] = {
        currentAmount,
        previousDue,
        totalPayable
      };

      if (booking.status === 'cancelled' || paid) {
        outstandingByStudent.set(studentId, 0);
      } else {
        outstandingByStudent.set(studentId, totalPayable);
      }
    });

    return bills;
  }, [bookings]);

  const maxMonthlyEarning = useMemo(
    () => Math.max(...monthlyEarnings, 1),
    [monthlyEarnings]
  );

  const barChartData = useMemo(
    () =>
      MONTHS.map((month, index) => ({
        month,
        amount: monthlyEarnings[index],
        height: Math.max((monthlyEarnings[index] / maxMonthlyEarning) * 100, monthlyEarnings[index] > 0 ? 7 : 0)
      })),
    [maxMonthlyEarning, monthlyEarnings]
  );

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    const preview = bookings.slice(0, 3);

    if (!term) return preview;

    return bookings.filter((booking) => {
      const student = booking?.studentId || {};
      const haystack = [
        student.studentId,
        student.name,
        student.gender,
        student.phoneNumber,
        booking?.seatId?.seatNo,
        booking?.shiftId?.shiftName,
        booking?.paymentId?.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [bookings, search]);

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      type: 'bookings'
    },
    {
      title: 'Total Seats',
      value: stats.totalSeats,
      type: 'seats'
    },
    {
      title: 'Available Seats',
      value: stats.availableSeats,
      type: 'available'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      type: 'earnings'
    },
    {
      title: 'Total Due',
      value: formatCurrency(totalDue),
      type: 'dues'
    }
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div>
          <h1>Dashboard</h1>
        </div>

        <Link to="/admin-profile" className="topbar__profile">
          <span>{admin?.name || 'Admin'}</span>
          <div
            className={`topbar__avatar ${
              admin?.profilePic ? 'topbar__avatar--image' : ''
            }`}
            aria-hidden="true"
          >
            {admin?.profilePic ? (
              <img src={admin.profilePic} alt="" />
            ) : (
              <span>{(admin?.name || 'A').slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <span className="topbar__chevron">⌄</span>
        </Link>
      </header>

      {loading ? (
        <div className="dashboard-loading">Loading dashboard...</div>
      ) : (
        <>
          <section className="stats-grid">
            {statsCards.map((card) => (
              <article className="stat-card" key={card.title}>
                <div className="stat-card__icon">
                  <StatIcon type={card.type} />
                </div>
                <div className="stat-card__body">
                  <p>{card.title}</p>
                  <strong>{card.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="table-card">
            <div className="table-card__header">
              <h2>Bookings</h2>
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  type="text"
                  placeholder="Search..."
                  autoComplete="off"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>

            <div className="table-card__body">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Gender</th>
                    <th>Mobile</th>
                    <th>Seat</th>
                    <th>Shift</th>
                    <th>Fees Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="booking-table__empty">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        bill={bookingBills[booking._id]}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bottom-grid">
            <article className="chart-card">
              <div className="chart-card__header">
                <div>
                  <h2>Students</h2>
                  <p>Total students, boys, girls and others</p>
                </div>
                <span className="chart-card__pill">
                  {studentBreakdown.total} total
                </span>
              </div>

              <div className="students-chart">
                <div
                  className="pie-chart"
                  style={{ background: studentPieGradient }}
                  aria-label="Student gender distribution pie chart"
                >
                  <div className="pie-chart__inner">
                    <strong>{studentBreakdown.total}</strong>
                    <span>Total Students</span>
                  </div>
                </div>

                <div className="chart-legend">
                  {studentSegments.map((segment) => (
                    <div className="chart-legend__item" key={segment.key}>
                      <span
                        className="chart-legend__swatch"
                        style={{ background: segment.color }}
                      />
                      <div>
                        <strong>{segment.label}</strong>
                        <span>{segment.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="chart-card chart-card--earnings">
              <div className="chart-card__header">
                <div>
                  <h2>Earnings</h2>
                  <p>{currentYear} monthly earnings</p>
                </div>
                <div className="chart-card__total">
                  <span>Total</span>
                  <strong>{formatCurrency(yearlyEarnings)}</strong>
                </div>
              </div>

              <div className="earnings-chart__wrap">
                <div className="earnings-chart">
                  {barChartData.map((item) => (
                    <div className="earnings-bar" key={item.month}>
                      <span className="earnings-bar__amount">
                        {formatCompactCurrency(item.amount)}
                      </span>
                      <div className="earnings-bar__track">
                        <div
                          className="earnings-bar__fill"
                          style={{ height: `${item.height}%` }}
                          title={`${item.month}: ${formatCurrency(item.amount)}`}
                        />
                      </div>
                      <span className="earnings-bar__month">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
