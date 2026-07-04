import { InputOTP, REGEXP_ONLY_DIGITS } from '@heroui/react';

export interface OtpBoxesProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export function OtpBoxes({ value, onChange, disabled, isInvalid }: OtpBoxesProps) {
  const slotClass =
    'w-11 h-12 text-center text-lg font-bold rounded-2xl border border-border-subtle/80 dark:border-white/20 bg-card-bg text-foreground hover:border-primary/50 data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary data-[filled=true]:border-primary/60 data-[filled=true]:bg-primary/5 transition-all';

  return (
    <div className="flex justify-center w-full mx-auto my-2">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        isDisabled={disabled}
        isInvalid={isInvalid}
        pattern={REGEXP_ONLY_DIGITS}
        variant="primary"
      >
        <InputOTP.Group className="gap-2">
          <InputOTP.Slot className={slotClass} index={0} />
          <InputOTP.Slot className={slotClass} index={1} />
          <InputOTP.Slot className={slotClass} index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group className="gap-2">
          <InputOTP.Slot className={slotClass} index={3} />
          <InputOTP.Slot className={slotClass} index={4} />
          <InputOTP.Slot className={slotClass} index={5} />
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}

export default OtpBoxes;
