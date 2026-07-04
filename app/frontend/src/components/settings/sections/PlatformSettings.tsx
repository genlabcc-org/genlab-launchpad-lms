import { useEffect, useState } from 'react';
import { TextField, Label, Input, CheckboxGroup, Checkbox } from '@heroui/react';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../../store/settingsStore';
import type { PlatformConfig } from '../../../store/settingsStore';
import Button from '../../ui/Button';

export function PlatformSettings() {
  const {
    platformConfig,
    platformConfigLoading,
    platformConfigError,
    fetchPlatformConfig,
    savePlatformConfig,
  } = useSettingsStore();

  // Local draft state for form edits
  const [draft, setDraft] = useState<PlatformConfig>({ ...platformConfig });
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync draft state with store config when fetched
  useEffect(() => {
    fetchPlatformConfig();
  }, [fetchPlatformConfig]);

  useEffect(() => {
    setDraft({ ...platformConfig });
  }, [platformConfig]);

  const handleCheckboxChange = (values: string[]) => {
    setDraft((prev) => ({
      ...prev,
      acceptedPaymentMethods: values,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    try {
      await savePlatformConfig(draft);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setDraft({ ...platformConfig });
    setIsSuccess(false);
  };

  if (platformConfigLoading && !draft.orgName) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs font-semibold text-slate-400">Loading platform settings...</p>
      </div>
    );
  }

  const inputClass =
    'w-full bg-slate-800/10 border border-border-subtle/50 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50';

  const fieldClass = 'flex flex-col gap-1.5';
  const labelClass = 'text-[10px] font-bold text-slate-500 tracking-wider uppercase';

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Page Title & Context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Platform & Organization Config</h2>
          <p className="text-xs text-slate-500 font-medium">
            System-level settings to configure tenant preferences across the LMS.
          </p>
        </div>
      </div>

      {platformConfigError && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{platformConfigError}</span>
        </div>
      )}

      {isSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
          Platform configurations updated successfully!
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Organization Name */}
        <TextField isRequired className={fieldClass}>
          <Label className={labelClass}>Organization / Tenant Name</Label>
          <Input
            type="text"
            value={draft.orgName}
            onChange={(e) => setDraft((prev) => ({ ...prev, orgName: e.target.value }))}
            className={inputClass}
          />
        </TextField>

        {/* Accepted Payment Methods (Checkboxes) */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <span className="text-xs font-semibold text-foreground">Accepted Payment Rails</span>
          <span className="text-[11px] text-slate-500 font-medium mb-1">
            Choose payment options selectable by billing admins during checkout.
          </span>
          <CheckboxGroup
            value={draft.acceptedPaymentMethods}
            onChange={handleCheckboxChange}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-row flex-wrap gap-4 text-xs">
              <Checkbox value="cash" className="cursor-pointer">
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span>Cash</span>
                </Checkbox.Content>
              </Checkbox>
              <Checkbox value="card" className="cursor-pointer">
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span>Card Payment</span>
                </Checkbox.Content>
              </Checkbox>
              <Checkbox value="bank transfer" className="cursor-pointer">
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span>Bank Transfer</span>
                </Checkbox.Content>
              </Checkbox>
              <Checkbox value="upi" className="cursor-pointer">
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span>UPI / Instant Transfer</span>
                </Checkbox.Content>
              </Checkbox>
              <Checkbox value="crypto" className="cursor-pointer">
                <Checkbox.Content className="flex items-center gap-2">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span>Cryptocurrency</span>
                </Checkbox.Content>
              </Checkbox>
            </div>
          </CheckboxGroup>
        </div>

        {/* Tag configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField className={fieldClass}>
            <Label className={labelClass}>Student Category Types (comma-separated)</Label>
            <Input
              type="text"
              value={draft.studentTypes.join(', ')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  studentTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              className={inputClass}
            />
          </TextField>

          <TextField className={fieldClass}>
            <Label className={labelClass}>Scheduling Time Presets (comma-separated)</Label>
            <Input
              type="text"
              value={draft.slotTimePresets.join(', ')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  slotTimePresets: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              className={inputClass}
            />
          </TextField>

          <TextField className={fieldClass}>
            <Label className={labelClass}>Enrollment Status Lists (comma-separated)</Label>
            <Input
              type="text"
              value={draft.enrollmentStatuses.join(', ')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  enrollmentStatuses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              className={inputClass}
            />
          </TextField>

          <TextField className={fieldClass}>
            <Label className={labelClass}>Referral Source Options (comma-separated)</Label>
            <Input
              type="text"
              value={draft.referralSources.join(', ')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  referralSources: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              className={inputClass}
            />
          </TextField>

          <TextField className={fieldClass}>
            <Label className={labelClass}>Max Students per Slot per Mentor</Label>
            <Input
              type="number"
              value={draft.maxStudentPerSlotPerMentor || ''}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  maxStudentPerSlotPerMentor: parseInt(e.target.value, 10) || 0,
                }))
              }
              className={inputClass}
            />
          </TextField>

          <TextField className={fieldClass}>
            <Label className={labelClass}>Max Students per Slot (All Mentors & Courses)</Label>
            <Input
              type="number"
              value={draft.maxStudentPerSlotAllMentorAllCourse || ''}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  maxStudentPerSlotAllMentorAllCourse: parseInt(e.target.value, 10) || 0,
                }))
              }
              className={inputClass}
            />
          </TextField>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle/60">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Reset Draft</span>
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="cursor-pointer font-semibold max-w-[160px]"
        >
          <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Changes</span>
        </Button>
      </div>
    </form>
  );
}

export default PlatformSettings;
