import { useEffect, useState, useCallback } from 'react';
import API from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // 🔹 Load students
  const loadStudents = useCallback(() => {
    setLoading(true);

    const url = showInactive
      ? '/students/inactive/list'
      : '/students';

    API.get(url)
      .then(res => setStudents(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showInactive]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 🔴 Deactivate
  const softDeleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await API.delete(`/students/soft/${id}`);
    loadStudents();
  };

  // 🟢 Reactivate
  const reactivateStudent = async (id) => {
    if (!window.confirm('Reactivate this student?')) return;
    await API.put(`/students/reactivate/${id}`);
    loadStudents();
  };

  if (loading) return <h3>Loading students...</h3>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Students</h1>

      {/* 🔘 TOGGLE */}
      <div style={{ margin: '15px 0' }}>
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            autoComplete="off"
            onChange={() => setShowInactive(p => !p)}
          />{' '}
          Show Inactive Students
        </label>
      </div>

      {/* 📋 TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.studentId}</td>
              <td>{s.name}</td>
              <td>{s.gender}</td>
              <td>{s.phoneNumber}</td>
              <td>
                {s.isDeleted ? (
                  <span style={{ color: 'gray' }}>Inactive</span>
                ) : (
                  <span style={{ color: 'green' }}>Active</span>
                )}
              </td>
              <td>
                {s.isDeleted ? (
                  <button onClick={() => reactivateStudent(s._id)}>
                    Reactivate
                  </button>
                ) : (
                  <button onClick={() => softDeleteStudent(s._id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Students;
