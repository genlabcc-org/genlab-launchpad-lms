import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export function StudentDashboard() {
  const [message, setMessage] = useState('Loading student portal...');

  useEffect(() => {
    apiClient
      .get('/api/student/dashboard')
      .then((res) => setMessage(res.data.message || 'Welcome Student'))
      .catch(() => setMessage('Welcome to your Student Learning Portal'));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Student Portal</h2>
        <p className="text-sm text-muted mt-1">{message}</p>
      </div>
    </div>
  );
}

export default StudentDashboard;
