<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedAttachmentsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_attachments')->delete();

        \DB::table('need_attachments')->insert([
            0 => [
                'id' => 7,
                'need_id' => 3,
                'display_name' => 'Dokumen tanpa judul.pdf',
                'file_path' => 'needs/3/SmkH3PO3ZdqP0KvZNovUsDKx4dgTi4de8yXuxmtd.pdf',
                'file_size' => 578431,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'created_at' => '2026-04-14 08:50:49',
                'updated_at' => '2026-04-14 08:50:49',
            ],
            1 => [
                'id' => 8,
                'need_id' => 3,
                'display_name' => 'Rancangan Aktualisasi_Nurul Farha.pdf',
                'file_path' => 'needs/3/bH4WzH8qAyiTWnP7lVrVzHZqyLClVnuwiRjZQV8w.pdf',
                'file_size' => 784814,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'created_at' => '2026-04-14 08:50:55',
                'updated_at' => '2026-04-14 08:50:55',
            ],
            2 => [
                'id' => 9,
                'need_id' => 1,
                'display_name' => 'docs_tanpa_judul.pdf',
                'file_path' => 'needs/1/x1yjawhI30sRKcNouQQ4swMEdeC81dQhZ49atH0K.pdf',
                'file_size' => 578431,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'created_at' => '2026-04-14 12:19:41',
                'updated_at' => '2026-04-14 12:19:41',
            ],
            3 => [
                'id' => 10,
                'need_id' => 1,
                'display_name' => 'KONSEP APLIKASI.docx',
                'file_path' => 'needs/1/kSVdqXTpTJMkDVeHalRjg6nM7WuZ3uIosHszP8co.docx',
                'file_size' => 18473,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'extension' => 'docx',
                'created_at' => '2026-04-14 12:22:12',
                'updated_at' => '2026-04-14 12:22:12',
            ],
            4 => [
                'id' => 11,
                'need_id' => 1,
                'display_name' => 'SOP Pembangunan dan Pengembangan Aplikasi.pdf',
                'file_path' => 'needs/1/QpDo0BiVJLW8QVkaZTECLD50xMrMlDHmUHxTTUxA.pdf',
                'file_size' => 241141,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'created_at' => '2026-04-14 12:22:27',
                'updated_at' => '2026-04-14 12:22:27',
            ],
            5 => [
                'id' => 12,
                'need_id' => 3,
                'display_name' => '685caf2390248463b1ac9cc668ba1204.jpg',
                'file_path' => 'needs/3/n1uEYkwi2Tp94IzH9jwKqJzROEZGn878M0uyLyCw.jpg',
                'file_size' => 17052,
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'created_at' => '2026-04-14 12:40:07',
                'updated_at' => '2026-04-14 12:40:07',
            ],
        ]);

    }
}
