import { CalendarRange } from 'lucide-react';

export function MentorSlotsDashboard() {
  return (
    <div className="flex flex-col h-full w-full gap-4 p-6 justify-center items-center">
      <div className="max-w-md p-8 bg-card-bg border border-border-subtle rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <CalendarRange className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">My Scheduling Calendar</h2>
        <p className="text-xs text-muted leading-relaxed">
          The calendar view for active slot allocations is currently scheduled for an upgrade. Please check back later.
        </p>
      </div>
    </div>
  );
}

export default MentorSlotsDashboard;
