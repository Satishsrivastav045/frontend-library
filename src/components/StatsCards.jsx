import Card from './Card';

const StatsCards = ({
  totalSeats,
  availableSeats,
  bookingToday,
  currentShift
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 30
      }}
    >
      <Card title="Total Bookings" value={bookingToday} />
      <Card title="Total Seats" value={totalSeats} />
      <Card title="Available Seats" value={availableSeats} />
      <Card title="Current Shift" value={currentShift} />
    </div>
  );
};

export default StatsCards;
