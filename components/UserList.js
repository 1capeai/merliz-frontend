"use client";

export default function UserList({ users }) {
  return (
    <div className="p-4 border mt-5">
      <h3 className="text-lg font-bold">👥 Registered Users</h3>
      {users.length === 0 ? <p>No users found.</p> : users.map((user, index) => (
        <div key={index} className="border-b p-3">
          <p>👤 Name: {user.name}</p>
          <p>📧 Email: {user.email}</p>
          <p>🚗 Role: {user.role}</p>
        </div>
      ))}
    </div>
  );
}
