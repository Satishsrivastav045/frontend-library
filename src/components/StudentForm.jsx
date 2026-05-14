import { useState } from 'react';
import API from '../services/api';

const StudentForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    gender: 'male',
    phoneNumber: '',
    address: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await API.post('/students', form);
      alert('Student added successfully');

      setForm({
        name: '',
        gender: 'male',
        phoneNumber: '',
        address: ''
      });

      onSuccess(); // 🔄 reload list
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
      <h3>Add Student</h3>

      <input
        placeholder="Student ID will be generated automatically"
        readOnly
      />
      <br /><br />

      <input
        name="name"
        placeholder="Name"
        autoComplete="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <br /><br />

      <select name="gender" value={form.gender} onChange={handleChange}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <br /><br />

      <input
        name="phoneNumber"
        placeholder="Phone"
        autoComplete="tel"
        value={form.phoneNumber}
        onChange={handleChange}
        required
      />
      <br /><br />

      <input
        name="address"
        placeholder="Address"
        autoComplete="street-address"
        value={form.address}
        onChange={handleChange}
      />
      <br /><br />

      <button type="submit">Add Student</button>
    </form>
  );
};

export default StudentForm;
