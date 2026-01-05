import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByRole } from '../../Services/LoginService';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUserByRole('All');
      setUsers(Array.isArray(response) ? response : []);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/AdminMenu');
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="container mt-4">
      <div className="card app-card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">User Management</h2>
          <button className="btn btn-light btn-sm" onClick={handleBack}>
            Back to Admin Menu
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {users.length === 0 ? (
            <div className="text-center text-muted">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{user.id || index + 1}</td>
                      <td>{user.fullName || user.name || 'N/A'}</td>
                      <td>{user.username || 'N/A'}</td>
                      <td>
                        <span className="badge bg-info">
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.active ? 'bg-success' : 'bg-secondary'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserManagement;
