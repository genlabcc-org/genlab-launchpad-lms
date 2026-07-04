import { useNavigate } from 'react-router-dom';
import { ListBox } from '@heroui/react';
import type { SettingsSection } from './settings.config';

interface SettingsNavProps {
  sections: SettingsSection[];
  activeRoute: string;
}

export function SettingsNav({ sections, activeRoute }: SettingsNavProps) {
  const navigate = useNavigate();

  return (
    <ListBox
      aria-label="Settings sections navigation"
      selectionMode="single"
      selectedKeys={new Set([activeRoute])}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string;
        if (selected) navigate(selected);
      }}
      className="w-full p-0 gap-1.5"
    >
      {sections.map((section) => {
        const SectionIcon = section.icon;
        const isActive = activeRoute === section.route;

        return (
          <ListBox.Item
            key={section.route}
            id={section.route}
            textValue={section.label}
            className={`group cursor-pointer transition-all rounded-xl p-0.5 w-full ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-2.5 w-full h-10">
              <SectionIcon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-primary-foreground' : 'text-slate-400 group-hover:text-primary'
                }`}
              />
              <span className="text-xs font-semibold truncate select-none">
                {section.label}
              </span>
            </div>
          </ListBox.Item>
        );
      })}
    </ListBox>
  );
}

export default SettingsNav;
