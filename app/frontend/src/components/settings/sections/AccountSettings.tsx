import { Avatar, TextField, Label, Input } from '@heroui/react';
import { Person } from '@gravity-ui/icons';
import { useAuthStore } from '../../../store/authStore';

export function AccountSettings() {
  const { userRole, email, phone, userId } = useAuthStore();

  // Derive username/display name from email
  const displayName = email
    ? email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase()
    : 'GENLAB USER';

  const inputClass =
    'w-full bg-slate-800/10 border border-border-subtle/50 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/50';

  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[10px] font-bold text-slate-500 tracking-wider uppercase';

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Account Information</h2>
        <p className="text-xs text-slate-500 font-medium">
          View your current workspace login credentials and profile mapping.
        </p>
      </div>

      {/* Profile Header Avatar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
        <Avatar size="lg" className="ring-2 ring-primary/20 bg-slate-800/20 border border-border-subtle cursor-default">
          <Avatar.Fallback className="bg-transparent">
            <Person className="w-6 h-6 text-slate-400" />
          </Avatar.Fallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{displayName}</h3>
            {userRole && (
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wide">
                {userRole}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">Organization Member • PEC Developers Initiative</p>
        </div>
      </div>

      {/* Read-Only Information Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Display Name</Label>
          <Input type="text" value={displayName} className={inputClass} />
        </TextField>

        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Email Address</Label>
          <Input type="email" value={email || ''} className={inputClass} />
        </TextField>

        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Phone Number</Label>
          <Input type="text" value={phone || 'Not Provided'} className={inputClass} />
        </TextField>

        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Workspace User ID</Label>
          <Input type="text" value={userId || 'sandbox-user-id'} className={inputClass} />
        </TextField>

        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Organization ID</Label>
          <Input type="text" value="60075798312" className={inputClass} />
        </TextField>

        <TextField isDisabled className={fieldClass}>
          <Label className={labelClass}>Assigned Role</Label>
          <Input type="text" value={userRole ? userRole.toUpperCase() : ''} className={inputClass} />
        </TextField>
      </div>
    </div>
  );
}

export default AccountSettings;
