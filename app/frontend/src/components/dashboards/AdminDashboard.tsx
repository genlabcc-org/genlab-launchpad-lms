import AnalyticsOverview from './AnalyticsOverview';
import { FtuxChecklist } from './FtuxChecklist';

export function AdminDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <FtuxChecklist />
      
      <AnalyticsOverview />
    </div>
  );
}

export default AdminDashboard;
