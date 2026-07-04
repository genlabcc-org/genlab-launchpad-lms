import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export function MentorDashboard() {
  const [message, setMessage] = useState('Loading mentor portal...');

  useEffect(() => {
    apiClient
      .get('/api/mentor/dashboard')
      .then((res) => setMessage(res.data.message || 'Welcome Mentor'))
      .catch(() => setMessage('Welcome to the Mentor Workspace'));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Mentor Portal</h2>
        <p className="text-sm text-muted mt-1">{message}</p>
      </div>
    </div>
  );
}

export default MentorDashboard;
