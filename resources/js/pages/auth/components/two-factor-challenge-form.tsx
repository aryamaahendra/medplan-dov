import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { ReactNode } from 'react';
import { FieldWrapper, InputField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

interface TwoFactorChallengeFormProps {
  showRecoveryInput: boolean;
  code: string;
  setCode: (code: string) => void;
  toggleRecoveryMode: (clearErrors: () => void) => void;
  toggleText: string;
}

export function TwoFactorChallengeForm({
  showRecoveryInput,
  code,
  setCode,
  toggleRecoveryMode,
  toggleText,
}: TwoFactorChallengeFormProps): ReactNode {
  return (
    <Form
      {...store.form()}
      className="space-y-4"
      resetOnError
      resetOnSuccess={!showRecoveryInput}
    >
      {({ errors, processing, clearErrors }) => (
        <>
          {showRecoveryInput ? (
            <InputField
              name="recovery_code"
              type="text"
              label="Recovery Code"
              hideLabel
              placeholder="Enter recovery code"
              autoFocus={showRecoveryInput}
              required
              error={errors.recovery_code}
            />
          ) : (
            <FieldWrapper
              error={errors.code}
              contentClassName="flex flex-col items-center justify-center space-y-3 text-center"
            >
              {({ id }) => (
                <div className="flex w-full items-center justify-center">
                  <InputOTP
                    id={id}
                    name="code"
                    maxLength={OTP_MAX_LENGTH}
                    value={code}
                    onChange={(value) => setCode(value)}
                    disabled={processing}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
            </FieldWrapper>
          )}

          <Button type="submit" className="w-full" disabled={processing}>
            Continue
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span>or you can </span>
            <button
              type="button"
              className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
              onClick={() => toggleRecoveryMode(clearErrors)}
            >
              {toggleText}
            </button>
          </div>
        </>
      )}
    </Form>
  );
}
