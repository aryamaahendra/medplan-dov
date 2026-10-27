import { Head, usePage } from '@inertiajs/react';

import { LandingHeader } from '@/components/landing/landing-header';
import { LandingHeroBanner } from '@/components/landing/landing-hero-banner';
import { LandingHeroInfo } from '@/components/landing/landing-hero-info';
import type { User } from '@/types';

interface WelcomeProps {
  canRegister?: boolean;
}

export default function Welcome({ canRegister = true }: WelcomeProps) {
  const { auth } = usePage<{ auth: { user: User | null } }>().props;

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>
      <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
        <LandingHeader user={auth.user} canRegister={canRegister} />
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
            <LandingHeroInfo />
            <LandingHeroBanner />
          </main>
        </div>
        <div className="hidden h-14.5 lg:block" />
      </div>
    </>
  );
}
