import {
  RiCodeLine,
  RiEyeLine,
  RiLayoutGridLine,
  RiRefreshLine,
} from '@remixicon/react';
import { useState } from 'react';
import {
  CheckboxField,
  FormCol,
  FormGrid,
  InputField,
  PasswordField,
  RadioField,
  SelectField,
  SingleCheckboxField,
  SwitchField,
  TextareaField,
} from '@/components/form';
import type { FieldOption } from '@/components/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PRIORITY_OPTIONS: FieldOption[] = [
  {
    value: 'low',
    label: 'Rendah (Low)',
    description: 'Dapat ditunda atau bersifat pelengkap operasional harian',
  },
  {
    value: 'medium',
    label: 'Sedang (Medium)',
    description: 'Kebutuhan standar pencapaian program kerja unit',
  },
  {
    value: 'high',
    label: 'Tinggi (High)',
    description: 'Mendesak dan berpengaruh langsung pada IKK / Renstra',
  },
];

const UNIT_OPTIONS: FieldOption[] = [
  { value: 'sekretariat', label: 'Sekretariat Utama' },
  { value: 'it', label: 'Pusat Data dan Informasi (Pusdatin)' },
  { value: 'kepegawaian', label: 'Biro Kepegawaian dan Organisasi' },
  { value: 'keuangan', label: 'Biro Keuangan dan BMN', disabled: true },
];

const NOTIFICATION_OPTIONS: FieldOption[] = [
  {
    value: 'email',
    label: 'Email Notifikasi',
    description: 'Kirim ringkasan mingguan via email resmi instansi',
  },
  {
    value: 'whatsapp',
    label: 'Pesan WhatsApp',
    description: 'Notifikasi instan saat usulan ditelaah atau disetujui',
  },
  {
    value: 'in_app',
    label: 'Notifikasi Aplikasi',
    description: 'Tampilkan pop-up lonceng di dashboard kerja',
  },
];

export function ShowcaseContent() {
  const [formData, setFormData] = useState({
    title: 'Pengadaan Server Cloud 2026',
    notes: 'Kebutuhan infrastruktur pendukung aplikasi manajemen kinerja.',
    priority: 'high',
    unit: 'it',
    notifications: ['email', 'in_app'],
    isActive: true,
    agreeTerms: true,
    password: 'super-secret-password',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({
    title: '',
    notes: '',
    priority: '',
    unit: '',
    notifications: '',
  });

  const toggleMockErrors = () => {
    if (formErrors.title) {
      setFormErrors({
        title: '',
        notes: '',
        priority: '',
        unit: '',
        notifications: '',
      });
    } else {
      setFormErrors({
        title: 'Judul usulan wajib diisi dan minimal 5 karakter.',
        notes: 'Catatan tidak boleh melebihi batas 200 karakter.',
        priority: 'Pilih salah satu tingkat prioritas yang valid.',
        unit: 'Unit kerja yang dipilih sedang tidak aktif.',
        notifications: 'Pilih minimal satu saluran notifikasi aktif.',
      });
    }
  };

  return (
    <div className="space-y-12 p-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Form Components
          </h1>
          <Badge variant="outline" className="text-xs">
            Developer Showcase
          </Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Sistem komponen formulir terstandarisasi berbasis primitif Field
          shadcn/ui. Mendukung varian{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            default
          </code>
          ,{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            description
          </code>
          , dan{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            choice-card
          </code>{' '}
          untuk Radio, Checkbox, dan Switch, serta sistem grid layout terpadu
          1–12 kolom dengan preset kepadatan (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            compact
          </code>
          ,{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            dense
          </code>
          ,{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            comfortable
          </code>
          ).
        </p>
      </div>

      {/* Live Interactive Playground Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <RiEyeLine className="size-4 text-primary" />
                Interactive Form Playground
              </CardTitle>
              <CardDescription>
                Uji coba interaksi form real-time dengan status validasi
                dinamis.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={formErrors.title ? 'destructive' : 'outline'}
                onClick={toggleMockErrors}
              >
                <RiRefreshLine className="mr-1 size-3.5" />
                {formErrors.title
                  ? 'Hapus Mock Errors'
                  : 'Simulasi Validation Errors'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <FormGrid cols={2} density="comfortable">
            <InputField
              label="Judul Usulan Kebutuhan"
              required
              info="Gunakan judul resmi yang mencerminkan paket pengadaan atau program."
              description="Contoh: Pengadaan Server Cloud TA 2026"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              error={formErrors.title}
              placeholder="Masukkan judul usulan"
            />

            <SelectField
              label="Unit Penanggung Jawab"
              required
              info="Unit kerja induk yang bertanggung jawab atas anggaran dan pelaksanaan."
              description="Hanya unit dengan status operasional aktif yang dapat dipilih."
              options={UNIT_OPTIONS}
              value={formData.unit}
              onValueChange={(val) => setFormData((p) => ({ ...p, unit: val }))}
              error={formErrors.unit}
              placeholder="Pilih unit kerja..."
            />

            <TextareaField
              label="Catatan & Ringkasan Teknis"
              description="Berikan penjelasan singkat mengenai urgensi dan justifikasi teknis."
              value={formData.notes}
              onChange={(e) =>
                setFormData((p) => ({ ...p, notes: e.target.value }))
              }
              error={formErrors.notes}
              placeholder="Tuliskan spesifikasi umum atau catatan penting di sini..."
              className="min-h-24"
            />

            <div className="space-y-4">
              <PasswordField
                label="Kata Sandi Otorisasi (Demo)"
                required
                info="Fitur show/hide password terintegrasi otomatis."
                value={formData.password}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Masukkan kata sandi"
              />

              <SwitchField
                label="Status Aktifkan Usulan Ini"
                description="Usulan yang aktif akan otomatis masuk ke pipeline kurasi."
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, isActive: Boolean(checked) }))
                }
              />
            </div>
          </FormGrid>

          <Separator />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <RadioField
              label="Prioritas Kebutuhan (Varian Choice Card)"
              required
              variant="choice-card"
              options={PRIORITY_OPTIONS}
              value={formData.priority}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, priority: val }))
              }
              error={formErrors.priority}
            />

            <CheckboxField
              label="Saluran Notifikasi (Varian Choice Card)"
              variant="choice-card"
              options={NOTIFICATION_OPTIONS}
              value={formData.notifications}
              onValueChange={(val) =>
                setFormData((p) => ({ ...p, notifications: val }))
              }
              error={formErrors.notifications}
            />
          </div>

          <SingleCheckboxField
            label="Saya menyatakan data usulan ini akurat dan telah diverifikasi oleh pimpinan unit."
            description="Konfirmasi ini berlaku sebagai persetujuan digital tahap awal."
            checked={formData.agreeTerms}
            onCheckedChange={(checked) =>
              setFormData((p) => ({ ...p, agreeTerms: Boolean(checked) }))
            }
          />
        </CardContent>
      </Card>

      {/* Section: RadioField Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            1. RadioField Variants
          </h2>
          <p className="text-xs text-muted-foreground">
            Pilihan varian:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              default
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              description
            </code>
            , dan{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              choice-card
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Default Compact
              </CardTitle>
              <CardDescription className="text-xs">
                Varian radio ringkas standar untuk opsi pendek.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioField
                label="Metode Pengadaan"
                required
                variant="default"
                defaultValue="tender"
                options={[
                  { value: 'tender', label: 'Tender Terbuka' },
                  { value: 'e_purchasing', label: 'E-Purchasing Katalog' },
                  { value: 'swakelola', label: 'Swakelola Tipe I' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Description Variant
              </CardTitle>
              <CardDescription className="text-xs">
                FieldLabel + FieldDescription di bawah setiap opsi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioField
                label="Tingkat Kerahasiaan"
                variant="description"
                defaultValue="internal"
                options={[
                  {
                    value: 'public',
                    label: 'Publik (Terbuka)',
                    description:
                      'Dapat diakses oleh publik dan masyarakat umum',
                  },
                  {
                    value: 'internal',
                    label: 'Terbatas (Internal)',
                    description:
                      'Hanya aparatur di lingkungan instansi terkait',
                  },
                  {
                    value: 'confidential',
                    label: 'Rahasia Negara',
                    description: 'Akses ketat dengan izin pimpinan tertinggi',
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Choice Card Variant
              </CardTitle>
              <CardDescription className="text-xs">
                FieldLabel menyelubungi Field sebagai kartu klik interaktif.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioField
                label="Prioritas Kebutuhan"
                variant="choice-card"
                defaultValue="medium"
                options={PRIORITY_OPTIONS}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section: CheckboxField Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            2. CheckboxField Variants
          </h2>
          <p className="text-xs text-muted-foreground">
            Mendukung single boolean checkbox atau group dengan varian{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              default
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              description
            </code>
            , dan{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              choice-card
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Default Checklist
              </CardTitle>
              <CardDescription className="text-xs">
                Checkbox kelompok standar untuk multi-pilihan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckboxField
                label="Dokumen Kelengkapan"
                variant="default"
                defaultValue={['kak']}
                options={[
                  { value: 'kak', label: 'Kerangka Acuan Kerja (KAK)' },
                  { value: 'rab', label: 'Rencana Anggaran Biaya (RAB)' },
                  { value: 'spek', label: 'Spesifikasi Teknis' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Description Variant
              </CardTitle>
              <CardDescription className="text-xs">
                Penjelasan rincian per checkbox item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckboxField
                label="Layanan Ekstra"
                variant="description"
                defaultValue={['backup']}
                options={[
                  {
                    value: 'backup',
                    label: 'Backup Otomatis Harian',
                    description: 'Snapshot database setiap pukul 02:00 WITA',
                  },
                  {
                    value: 'sla',
                    label: 'Dukungan SLA 99.9%',
                    description: 'Respon insiden prioritas dalam 15 menit',
                  },
                  {
                    value: 'audit',
                    label: 'Audit Log Keamanan',
                    description: 'Pencatatan rekam jejak akses administrator',
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Choice Card Variant
              </CardTitle>
              <CardDescription className="text-xs">
                Kotak pilihan kartu mandiri yang dapat dipilih bersamaan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckboxField
                label="Saluran Notifikasi"
                variant="choice-card"
                defaultValue={['email', 'in_app']}
                options={NOTIFICATION_OPTIONS}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section: SwitchField Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            3. SwitchField Variants
          </h2>
          <p className="text-xs text-muted-foreground">
            Varian{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              default
            </code>
            ,{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              description
            </code>
            , dan{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              choice-card
            </code>{' '}
            untuk switch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Default Horizontal
              </CardTitle>
              <CardDescription className="text-xs">
                Sakelar ringkas standar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SwitchField label="Mode Pemeliharaan" />
              <SwitchField label="Izinkan Komentar Pengguna" defaultChecked />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                With Description
              </CardTitle>
              <CardDescription className="text-xs">
                Sakelar dengan teks bantuan penjelas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField
                label="Sinkronisasi Otomatis"
                description="Sinkronkan data usulan dengan database SIPD setiap jam."
                defaultChecked
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Choice Card Variant
              </CardTitle>
              <CardDescription className="text-xs">
                Card-style clickable container untuk toggle preferensi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SwitchField
                variant="choice-card"
                label="Autentikasi Dua Langkah (2FA)"
                description="Wajibkan kode TOTP aplikasi pada setiap proses login akun."
                defaultChecked
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section: Grid Presets & Density Layouts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <RiLayoutGridLine className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              4. Grid Presets & Layout Density (Cols 1-12, Compact, Dense,
              Comfortable)
            </h2>
            <p className="text-xs text-muted-foreground">
              Gunakan{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                &lt;FormGrid cols=&#123;N&#125;
                density=&#123;&quot;...&quot;&#125;&gt;
              </code>{' '}
              dan{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                &lt;FormCol span=&#123;N&#125;&gt;
              </code>{' '}
              atau prop langsung{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                cols=&#123;N&#125; density=&#123;&quot;dense&quot;&#125;
              </code>{' '}
              pada Radio &amp; Checkbox.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dense Grid Example */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Preset: Dense Grid (cols=4, density=&quot;dense&quot;)
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  gap-1.5
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Tata letak sangat padat untuk tabel input cepat atau form entri
                data massal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid cols={4} density="dense">
                <InputField label="Kode Satker" placeholder="01.02.03" />
                <InputField label="Tahun" placeholder="2026" />
                <InputField label="Target Volume" placeholder="100" />
                <InputField label="Satuan" placeholder="Paket" />
              </FormGrid>
            </CardContent>
          </Card>

          {/* Compact Grid Example */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Preset: Compact Grid (cols=3, density=&quot;compact&quot;)
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  gap-2
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Kepadatan kompak yang efisien untuk modal dialog atau form
                samping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid cols={3} density="compact">
                <InputField label="Nama Depan" placeholder="Ahmad" />
                <InputField label="Nama Belakang" placeholder="Dahlan" />
                <InputField label="Gelar Belakang" placeholder="S.Kom, M.M." />
              </FormGrid>
            </CardContent>
          </Card>

          {/* 12-Column Flexible Layout Example */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Preset: 12-Column Layout Grid (FormGrid cols=12 + FormCol
                  span=N)
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  12 Cols
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Sistem kolom 12 responsif untuk formulir kompleks dengan
                proporsi asimetris.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid cols={12} density="comfortable">
                <FormCol span={8}>
                  <InputField
                    label="Alamat Kantor Satuan Kerja (span=8)"
                    placeholder="Jl. Jenderal Sudirman No. 45"
                  />
                </FormCol>
                <FormCol span={4}>
                  <InputField label="Kode Pos (span=4)" placeholder="70114" />
                </FormCol>
                <FormCol span={4}>
                  <InputField
                    label="Provinsi (span=4)"
                    defaultValue="Kalimantan Selatan"
                  />
                </FormCol>
                <FormCol span={4}>
                  <InputField
                    label="Kota / Kabupaten (span=4)"
                    defaultValue="Kota Banjarbaru"
                  />
                </FormCol>
                <FormCol span={4}>
                  <InputField
                    label="Kecamatan (span=4)"
                    defaultValue="Banjarbaru Selatan"
                  />
                </FormCol>
              </FormGrid>
            </CardContent>
          </Card>

          {/* Checkbox & Radio Grid Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Radio &amp; Checkbox Group dengan Grid Presets (cols=3,
                density=&quot;compact&quot;)
              </CardTitle>
              <CardDescription className="text-xs">
                Penataan otomatis pilihan dalam format multi-kolom rapi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioField
                label='Pilihan Triwulan Pelaksanaan (cols=4, variant="choice-card")'
                variant="choice-card"
                cols={4}
                density="compact"
                defaultValue="tw1"
                options={[
                  {
                    value: 'tw1',
                    label: 'Triwulan I',
                    description: 'Jan - Mar',
                  },
                  {
                    value: 'tw2',
                    label: 'Triwulan II',
                    description: 'Apr - Jun',
                  },
                  {
                    value: 'tw3',
                    label: 'Triwulan III',
                    description: 'Jul - Sep',
                  },
                  {
                    value: 'tw4',
                    label: 'Triwulan IV',
                    description: 'Okt - Des',
                  },
                ]}
              />

              <CheckboxField
                label='Hari Kerja Operasional (cols={5}, density="compact")'
                cols={5}
                density="compact"
                defaultValue={['senin', 'selasa', 'rabu', 'kamis', 'jumat']}
                options={[
                  { value: 'senin', label: 'Senin' },
                  { value: 'selasa', label: 'Selasa' },
                  { value: 'rabu', label: 'Rabu' },
                  { value: 'kamis', label: 'Kamis' },
                  { value: 'jumat', label: 'Jumat' },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Documentation / Code Examples */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <RiCodeLine className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">
            Developer Usage Guide (Variants &amp; Grid Presets)
          </h2>
        </div>

        <Card className="border-border bg-muted/40">
          <CardContent className="space-y-4 pt-6 font-mono text-xs">
            <div>
              <p className="mb-1 font-sans text-sm font-semibold text-muted-foreground">
                1. Menggunakan Varian Radio &amp; Checkbox (default,
                description, choice-card)
              </p>
              <pre className="overflow-x-auto rounded-md border bg-card p-3 text-foreground">
                {`// 1. Choice Card Radio Group dengan 3 kolom
<RadioField
  label="Prioritas"
  variant="choice-card"
  cols={3}
  density="comfortable"
  options={[
    { value: 'low', label: 'Low', description: 'Bisa ditunda' },
    { value: 'high', label: 'High', description: 'Mendesak' },
  ]}
/>

// 2. Description Checkbox Group
<CheckboxField
  label="Layanan"
  variant="description"
  options={options}
/>

// 3. Choice Card Switch
<SwitchField
  variant="choice-card"
  label="2FA Auth"
  description="Aktifkan autentikasi dua faktor"
/>`}
              </pre>
            </div>

            <div>
              <p className="mb-1 font-sans text-sm font-semibold text-muted-foreground">
                2. Menggunakan FormGrid (Cols 1-12, Density Presets)
              </p>
              <pre className="overflow-x-auto rounded-md border bg-card p-3 text-foreground">
                {`import { FormGrid, FormCol, InputField } from '@/components/form';

<FormGrid cols={12} density="compact">
  <FormCol span={8}>
    <InputField label="Alamat" />
  </FormCol>
  <FormCol span={4}>
    <InputField label="Kode Pos" />
  </FormCol>
</FormGrid>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
