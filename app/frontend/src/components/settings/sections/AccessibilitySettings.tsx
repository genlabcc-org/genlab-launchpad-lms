import { Switch, RadioGroup, Radio } from '@heroui/react';
import { useSettingsStore } from '../../../store/settingsStore';
import type { FontSize } from '../../../store/settingsStore';

export function AccessibilitySettings() {
  const { accessibility, setAccessibility } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Accessibility Preferences</h2>
        <p className="text-xs text-slate-500 font-medium">
          Adjust accessibility toggles to customize how you interact with elements on the workspace.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">Reduce Motion</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Disables animations and transitional physics across dashboard views.
            </span>
          </div>
          <Switch
            isSelected={accessibility.reduceMotion}
            onChange={(val: boolean) => setAccessibility({ reduceMotion: val })}
            aria-label="Toggle Reduce Motion"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">High Contrast Mode</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Amplifies background-to-text separation parameters for heightened legibility.
            </span>
          </div>
          <Switch
            isSelected={accessibility.highContrast}
            onChange={(val: boolean) => setAccessibility({ highContrast: val })}
            aria-label="Toggle High Contrast Mode"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        {/* Global Font Scale Selector */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border-subtle bg-card-bg/40 backdrop-blur-md">
          <div className="flex flex-col gap-0.5 mb-2">
            <span className="text-xs font-semibold text-foreground">Global Display Scale (Font Size)</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Scale layout typography sizing context-wide.
            </span>
          </div>
          <RadioGroup
            value={accessibility.fontSize}
            onChange={(val: string) => setAccessibility({ fontSize: val as FontSize })}
            className="w-full"
          >
            <div className="flex flex-row flex-wrap gap-4 text-xs">
              <Radio value="small" className="cursor-pointer">
                <Radio.Content className="flex items-center gap-2">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span>Small (87.5%)</span>
                </Radio.Content>
              </Radio>
              <Radio value="medium" className="cursor-pointer">
                <Radio.Content className="flex items-center gap-2">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span>Medium (Default)</span>
                </Radio.Content>
              </Radio>
              <Radio value="large" className="cursor-pointer">
                <Radio.Content className="flex items-center gap-2">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span>Large (112.5%)</span>
                </Radio.Content>
              </Radio>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

export default AccessibilitySettings;
