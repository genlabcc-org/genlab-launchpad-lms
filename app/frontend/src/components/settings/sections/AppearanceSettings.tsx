import { Switch, RadioGroup, Radio } from '@heroui/react';
import { useSettingsStore } from '../../../store/settingsStore';
import type { CrmTheme } from '../../../store/settingsStore';
import { useAuthStore } from '../../../store/authStore';

export function AppearanceSettings() {
  const { userRole } = useAuthStore();
  const {
    theme,
    activeCrmTheme,
    density,
    sidebarCollapsedByDefault,
    setTheme,
    setCrmTheme,
    setDensity,
    setSidebarCollapsedByDefault,
  } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Appearance</h2>
        <p className="text-xs text-slate-500 font-medium">
          Customize how GenLab Launchpad LMS looks on your screen.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Dark / Light Mode Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">Theme Mode</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Switch between light mode and dark mode.
            </span>
          </div>
          <Switch
            isSelected={theme === 'dark'}
            onChange={(isSelected: boolean) => setTheme(isSelected ? 'dark' : 'light')}
            aria-label="Toggle Light/Dark Theme"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        {/* CRM Skin Picker (Admin & Mentor Only) */}
        {userRole !== 'student' && (
          <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
            <div className="flex flex-col gap-0.5 mb-2">
              <span className="text-xs font-semibold text-foreground">CRM Skin Theme</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Choose a specific color scheme based on your preferences.
              </span>
            </div>

            <RadioGroup
              value={activeCrmTheme}
              onChange={(val: string) => setCrmTheme(val as CrmTheme)}
              className="w-full"
            >
              <div className="flex flex-row flex-wrap gap-4 text-xs">
                <Radio value="genlab" className="cursor-pointer">
                  <Radio.Content className="flex items-center gap-2">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <span>GenLab (Blue/Mint)</span>
                  </Radio.Content>
                </Radio>
                <Radio value="zoho-crm" className="cursor-pointer">
                  <Radio.Content className="flex items-center gap-2">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <span>Zoho CRM (Red/Amber)</span>
                  </Radio.Content>
                </Radio>
                <Radio value="odoo-crm" className="cursor-pointer">
                  <Radio.Content className="flex items-center gap-2">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <span>Odoo CRM (Purple/Blue)</span>
                  </Radio.Content>
                </Radio>
                <Radio value="sap-crm" className="cursor-pointer">
                  <Radio.Content className="flex items-center gap-2">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <span>SAP Fiori (Teal/Dark)</span>
                  </Radio.Content>
                </Radio>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Sidebar Default Collapse Mode */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">Collapse Sidebar by Default</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Start with the left navigation sidebar collapsed for more screen space.
            </span>
          </div>
          <Switch
            isSelected={sidebarCollapsedByDefault}
            onChange={setSidebarCollapsedByDefault}
            aria-label="Toggle Sidebar default collapse state"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        {/* Spacing / Density Switcher */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5 mb-2">
            <span className="text-xs font-semibold text-foreground">Interface Density</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Adjust spacing of screen elements to fit more content.
            </span>
          </div>
          <RadioGroup
            value={density}
            onChange={(val: string) => setDensity(val as 'comfortable' | 'compact')}
            className="w-full"
          >
            <div className="flex flex-row flex-wrap gap-4 text-xs">
              <Radio value="comfortable" className="cursor-pointer">
                <Radio.Content className="flex items-center gap-2">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span>Comfortable</span>
                </Radio.Content>
              </Radio>
              <Radio value="compact" className="cursor-pointer">
                <Radio.Content className="flex items-center gap-2">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span>Compact (Dense)</span>
                </Radio.Content>
              </Radio>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

export default AppearanceSettings;
