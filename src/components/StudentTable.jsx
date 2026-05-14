const StudentTable = ({ students }) => {
  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Gender</th>
          <th>Phone</th>
          <th>Address</th>
        </tr>
      </thead>

      <tbody>
        {students.map(student => (
          <tr key={student._id}>
            <td>{student.studentId}</td>
            <td>{student.name}</td>
            <td>{student.gender}</td>
            <td>{student.phoneNumber}</td>
            <td>{student.address}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentTable;
