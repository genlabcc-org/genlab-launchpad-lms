import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import AnalyticsOverview from './AnalyticsOverview';
import { FtuxChecklist } from './FtuxChecklist';

export function AdminDashboard() {
  const [message, setMessage] = useState('Loading admin portal...');

  useEffect(() => {
    apiClient
      .get('/api/admin/dashboard')
      .then((res) => setMessage(res.data.message || 'Welcome Admin'))
      .catch(() => setMessage('Welcome to the Admin Management Portal'));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <div className="p-6 bg-card-bg border border-border-subtle rounded-3xl shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Admin Portal</h2>
        <p className="text-sm text-muted mt-1">{message}</p>
      </div>

      <FtuxChecklist />
      
      <AnalyticsOverview />
    </div>
  );
}

export default AdminDashboard;
