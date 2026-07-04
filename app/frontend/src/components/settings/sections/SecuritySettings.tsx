import { useEffect, useState } from 'react';
import { TextField, Label, Input } from '@heroui/react';
import { KeyRound, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../ui/Button';

export function SecuritySettings() {
  const { userRole, email } = useAuthStore();
  const [sessionDays, setSessionDays] = useState('0');

  useEffect(() => {
    const loginAtStr = localStorage.getItem('loginAt');
    if (loginAtStr) {
      const loginTime = new Date(loginAtStr).getTime();
      const elapsedMs = Date.now() - loginTime;
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      setSessionDays(elapsedDays.toString());
    }
  }, []);

  const inputClass =
    'w-full bg-slate-800/10 border border-border-subtle/50 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/50';

  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[10px] font-bold text-slate-500 tracking-wider uppercase';

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Security & Session</h2>
        <p className="text-xs text-slate-500 font-medium">
          Manage your account credentials, security preferences, and active devices.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Active Session Info Box */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              Current Session Status
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Signed in {sessionDays === '0' ? 'today' : `${sessionDays} days ago`} as <span className="text-primary font-bold">{email}</span>
            </span>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            Active
          </span>
        </div>

        {/* Form Inputs (Read-only metadata) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField isDisabled className={fieldClass}>
            <Label className={labelClass}>Authorized Role Domain</Label>
            <Input
              type="text"
              value={userRole ? userRole.toUpperCase() : ''}
              className={inputClass}
            />
          </TextField>

          <TextField isDisabled className={fieldClass}>
            <Label className={labelClass}>Device Context IP</Label>
            <Input
              type="text"
              value="192.168.1.1 (Virtual Sandbox)"
              className={inputClass}
            />
          </TextField>
        </div>

        {/* Change Credentials (Coming Soon Stubs) */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            Security Controls
          </span>
          <span className="text-[11px] text-slate-500 font-medium mb-1">
            Additional security measures can be changed via the Supabase auth flow (coming soon).
          </span>

          <div className="flex flex-wrap gap-3 animate-pulse">
            <Button
              type="button"
              variant="outline"
              isDisabled
              className="opacity-50 cursor-not-allowed max-w-[240px]"
            >
              <span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4" /> Reset Credentials (Soon)</span>
            </Button>
            <Button
              type="button"
              variant="danger"
              isDisabled
              className="opacity-50 cursor-not-allowed max-w-[240px]"
            >
              <span className="flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Sign Out All Devices (Soon)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;
