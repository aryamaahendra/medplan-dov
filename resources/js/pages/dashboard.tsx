import { Head } from '@inertiajs/react';

export default function Dashboard() {
  return (
    <>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-2xl font-bold">Selamat Datang</h1>
        <p className="text-muted-foreground">
          Pilih kelompok usulan untuk melihat ringkasan.
        </p>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
};
