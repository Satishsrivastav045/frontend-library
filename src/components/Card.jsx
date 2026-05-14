const Card = ({ title, value }) => {
  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        minWidth: 180,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ fontSize: 14, color: '#6b7280' }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 'bold', marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
};

export default Card;
