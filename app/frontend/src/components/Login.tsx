import { Card, Avatar, TextField, Label, Input, Description, FieldError } from '@heroui/react';
import { Sun, Moon } from '@gravity-ui/icons';
import logoLight from '../assets/brand/logo.svg';
import logoWhite from '../assets/brand/logo-white.svg';
import Button from './ui/Button';
import { CountryDropdown } from './CountryDropdown';
import { OtpBoxes } from './OtpBoxes';
import { useLogin } from '../hooks/useLogin';

export function Login() {
  const {
    identifier,
    rawInput,
    isPhoneMode,
    selectedCountry,
    isDropdownOpen,
    otpToken,
    step,
    loading,
    errorMessage,
    successMessage,
    theme,
    toggleTheme,
    handleInputChange,
    handleCountrySelect,
    handleRequestOtp,
    handleVerifyOtp,
    resetStep,
    setIsDropdownOpen,
    setOtpToken,
    setErrorMessage,
  } = useLogin();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4">
      {/* Top Right Theme Widget */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-border-subtle bg-card-bg hover:opacity-85 text-foreground transition-all flex items-center justify-center cursor-pointer"
          title="Toggle Dark/Light Mode"
          type="button"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-[420px] shadow-2xl bg-card-bg border border-border-subtle p-6 transition-all duration-300">
        <Card.Header className="flex flex-col items-center gap-2 pb-4">
          <Avatar className="size-16">
            <Avatar.Image
              alt="GenLab Logo"
              src={theme === 'dark' ? logoWhite : logoLight}
            />
            <Avatar.Fallback>GL</Avatar.Fallback>
          </Avatar>
          <Card.Title className="text-2xl font-bold tracking-tight text-foreground text-center">
            GenLab Launchpad
          </Card.Title>
          <Card.Description className="text-sm text-muted text-center">
            Sign in to access your dashboard portal
          </Card.Description>
        </Card.Header>

        <Card.Content className="py-2">
          {/* Success banner — shown above form on positive state */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm text-center font-medium">
              {successMessage}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <TextField
                fullWidth
                className="gap-2"
                name="credentials"
                isRequired
                isDisabled={loading}
                isInvalid={!!errorMessage}
              >
                <Label>Credentials</Label>
                <div className="flex gap-2 w-full relative">
                  {/* Country Code Dropdown - shown dynamically in phone mode */}
                  {isPhoneMode && (
                    <CountryDropdown
                      selectedCountry={selectedCountry}
                      isOpen={isDropdownOpen}
                      disabled={loading}
                      onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                      onClose={() => setIsDropdownOpen(false)}
                      onSelect={handleCountrySelect}
                    />
                  )}

                  {/* Persistent Input Component */}
                  <Input
                    type={isPhoneMode ? 'tel' : 'text'}
                    placeholder={isPhoneMode ? 'Enter 10-digit mobile number' : 'Enter Email or Phone Number'}
                    maxLength={isPhoneMode ? 10 : undefined}
                    value={rawInput}
                    onChange={(e: any) => {
                      const val = typeof e === 'string' ? e : e?.target?.value ?? '';
                      handleInputChange(val);
                    }}
                    className="flex-1 border border-border-subtle rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary aria-invalid:border-red-500 aria-invalid:focus:ring-red-500"
                  />
                </div>
                {errorMessage ? (
                  <FieldError>{errorMessage}</FieldError>
                ) : (
                  <Description>
                    {isPhoneMode
                      ? 'Enter your 10-digit Indian mobile number (+91).'
                      : 'Students use phone number & Mentors use email.'}
                  </Description>
                )}
              </TextField>

              <Button
                type="submit"
                variant="primary"
                isDisabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-sm text-muted text-center">
                OTP sent to <span className="font-semibold text-foreground">{identifier}</span>
              </div>

              <TextField
                fullWidth
                className="gap-2"
                name="otp"
                isRequired
                isDisabled={loading}
                isInvalid={!!errorMessage}
              >
                <Label className="text-center w-full block">One-Time Password</Label>
                <OtpBoxes
                  value={otpToken}
                  onChange={(val) => {
                    setOtpToken(val);
                    setErrorMessage(null);
                  }}
                  disabled={loading}
                  isInvalid={!!errorMessage}
                />
                {errorMessage && (
                  <FieldError className="text-center block">{errorMessage}</FieldError>
                )}
              </TextField>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  isDisabled={loading}
                  className="flex-1"
                  onClick={resetStep}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify and Sign In'}
                </Button>
              </div>
            </form>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default Login;
