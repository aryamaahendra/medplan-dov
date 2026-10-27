import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      name: string;
      auth: Auth;
      sidebarOpen: boolean;
      enableDevTools?: boolean;
      activeNeedGroups?: Array<{ id: number; name: string; year: number }>;
      [key: string]: unknown;
    };
  }
}
