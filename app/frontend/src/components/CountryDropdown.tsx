import { ChevronDown } from 'lucide-react';
import { COUNTRY_OPTIONS, type CountryOption } from '../data/countries';

interface CountryDropdownProps {
  selectedCountry: CountryOption;
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
}

export function CountryDropdown({
  selectedCountry,
  isOpen,
  disabled,
  onToggle,
  onClose,
  onSelect,
}: CountryDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="h-full px-3 py-2 flex items-center gap-1.5 border border-border-subtle rounded-2xl bg-card-bg text-foreground text-sm font-medium hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer disabled:opacity-50"
        title="Select Country Code"
        aria-label="Select Country Code"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-semibold text-xs">{selectedCountry.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-0 top-full mt-1.5 w-56 z-50 rounded-2xl border border-border-subtle bg-card-bg shadow-xl p-1.5 flex flex-col gap-1 text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">
              Available Country Codes
            </div>
            {COUNTRY_OPTIONS.map((c) => (
              <button
                key={c.country + c.code}
                type="button"
                disabled={!c.enabled}
                onClick={() => onSelect(c)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                  c.enabled
                    ? 'hover:bg-primary/10 text-foreground cursor-pointer font-semibold'
                    : 'opacity-40 cursor-not-allowed text-muted bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.country}</span>
                </div>
                <span className="font-mono text-[11px] text-muted">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CountryDropdown;
