import { Form } from '@inertiajs/react';
import { RiShieldCheckLine } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

interface TwoFactorSectionProps {
  requiresConfirmation?: boolean;
  twoFactorEnabled?: boolean;
}

export function TwoFactorSection({
  requiresConfirmation = false,
  twoFactorEnabled = false,
}: TwoFactorSectionProps) {
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const prevTwoFactorEnabled = useRef(twoFactorEnabled);

  const {
    qrCodeSvg,
    hasSetupData,
    manualSetupKey,
    clearSetupData,
    clearTwoFactorAuthData,
    fetchSetupData,
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
  } = useTwoFactorAuth();

  useEffect(() => {
    if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
      clearTwoFactorAuthData();
    }

    prevTwoFactorEnabled.current = twoFactorEnabled;
  }, [twoFactorEnabled, clearTwoFactorAuthData]);

  return (
    <div className="flex flex-col items-start justify-start space-y-4">
      {twoFactorEnabled ? (
        <>
          <p className="text-sm text-muted-foreground">
            You will be prompted for a secure, random pin during login, which
            you can retrieve from the TOTP-supported application on your phone.
          </p>

          <div className="relative inline">
            <Form {...disable.form()}>
              {({ processing }) => (
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={processing}
                >
                  Disable 2FA
                </Button>
              )}
            </Form>
          </div>

          <TwoFactorRecoveryCodes
            recoveryCodesList={recoveryCodesList}
            fetchRecoveryCodes={fetchRecoveryCodes}
            errors={errors}
          />
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            When you enable two-factor authentication, you will be prompted for
            a secure pin during login. This pin can be retrieved from a
            TOTP-supported application on your phone.
          </p>

          <div>
            {hasSetupData ? (
              <Button onClick={() => setShowSetupModal(true)}>
                <RiShieldCheckLine data-icon="inline-start" />
                Continue setup
              </Button>
            ) : (
              <Form
                {...enable.form()}
                onSuccess={() => setShowSetupModal(true)}
              >
                {({ processing }) => (
                  <Button type="submit" disabled={processing}>
                    Enable 2FA
                  </Button>
                )}
              </Form>
            )}
          </div>
        </>
      )}

      <TwoFactorSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        requiresConfirmation={requiresConfirmation}
        twoFactorEnabled={twoFactorEnabled}
        qrCodeSvg={qrCodeSvg}
        manualSetupKey={manualSetupKey}
        clearSetupData={clearSetupData}
        fetchSetupData={fetchSetupData}
        errors={errors}
      />
    </div>
  );
}
