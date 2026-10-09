import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { TwoFactorSection } from '@/features/settings/components/two-factor-section';
import { UpdatePasswordForm } from '@/features/settings/components/update-password-form';
import { edit } from '@/routes/security';

type Props = {
  canManageTwoFactor?: boolean;
  requiresConfirmation?: boolean;
  twoFactorEnabled?: boolean;
};

export default function Security({
  canManageTwoFactor = false,
  requiresConfirmation = false,
  twoFactorEnabled = false,
}: Props) {
  return (
    <>
      <Head title="Security settings" />

      <h1 className="sr-only">Security settings</h1>

      <div className="space-y-6">
        <Heading
          variant="small"
          title="Update password"
          description="Ensure your account is using a long, random password to stay secure"
        />

        <UpdatePasswordForm />
      </div>

      {canManageTwoFactor && (
        <div className="space-y-6">
          <Heading
            variant="small"
            title="Two-factor authentication"
            description="Manage your two-factor authentication settings"
          />

          <TwoFactorSection
            requiresConfirmation={requiresConfirmation}
            twoFactorEnabled={twoFactorEnabled}
          />
        </div>
      )}
    </>
  );
}

Security.layout = {
  breadcrumbs: [
    {
      title: 'Security settings',
      href: edit(),
    },
  ],
};
