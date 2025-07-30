import React from 'react';
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
    </div>
  );
};

export default Dashboard;