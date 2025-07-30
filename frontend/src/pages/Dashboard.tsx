import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, {user?.username}!</p>
      <div>
        <h2>Your Information</h2>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Links</h2>
        <Link to="/projects" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          View Your Projects
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;