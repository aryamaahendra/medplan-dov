<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Detail Usulan: {{ $need->title }}</title>
  <style>
    @page {
      margin: {{ $marginTop }}mm {{ $marginRight }}mm {{ $marginBottom }}mm {{ $marginLeft }}mm;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      text-align: justify;
    }

    .header {
      text-align: center;
      margin-bottom: 12px;
    }

    .header h1 {
      margin: 0;
      font-size: 18px;
      text-transform: uppercase;
    }

    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      color: #666;
    }

    table {
      width: 100%;
      margin-bottom: 20px;
    }

    th,
    td {
      padding: 8px 10px 8px 0;
      vertical-align: top;
    }

    th {
      width: 30%;
      font-weight: bold;
    }

    .content-value {
      padding-left: 28px;
    }

    .content-value p,
    .content-value li {
      margin-top: 0;
      text-align: justify;
    }

    .content-value ul,
    .content-value ol {
      margin-top: 0;
      padding-left: 20px;
    }

    h2,
    h3,
    h4 {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .signature-wrapper {
      margin-top: 50px;
      width: 100%;
      page-break-inside: avoid;
    }

    .signature-block {
      float: right;
      min-width: 250px;
      text-align: center;
    }

    .signature-block p {
      margin: 0;
    }

    .signature-space {
      height: 90px;
    }

    .signature-name {
      font-weight: bold;
      text-decoration: underline;
      white-space: nowrap;
      margin-top: 5px;
    }

    /* Cover Page Styles */
    .cover-page {
      width: 100%;
      height: 90vh;
      display: table;
      text-align: center;
    }

    .cover-content {
      display: table-cell;
      vertical-align: middle;
      width: 100%;
      text-align: center;
      padding-top: 100px;
    }

    .cover-page img {
      width: 140px;
      margin: 40px auto;
      display: block;
    }

    .cover-page h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
      line-height: 1.2;
    }

    .cover-info {
      margin-top: 40px;
      margin-bottom: 150px;
      width: 100%;
    }

    .cover-info table {
      width: auto;
      margin: 0 auto;
      border-collapse: collapse;
      text-align: left;
    }

    .cover-info td {
      padding: 5px 10px;
      font-size: 16px;
      vertical-align: top;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>

<body>
  <div class="cover-page">
    <div class="cover-content">
      <h1>SPESIFIKASI TEKNIS</h1>
      <h1 class="need-title">PENGADAAN {{ $need->title }}</h1>

      <img src="{{ public_path('logo_kabelota.png') }}" alt="Logo">

      <div class="cover-info">
        <table>
          <tr>
            <td style="width: 120px;">SATKER/SKPD</td>
            <td style="width: 10px;">:</td>
            <td style="">RSUD Kabelota Donggala</td>
          </tr>
          <tr>
            <td style="">Nama KPA</td>
            <td>:</td>
            <td style="white-space: nowrap;">
              {{ $signer?->name ?? 'ARDIAN WIJAYA, S.T., M.T.' }}
            </td>
          </tr>
          <tr>
            <td style="">Nama Pekerjaan</td>
            <td>:</td>
            <td>Pengadaan {{ $need->title }}</td>
          </tr>
        </table>
      </div>

      <h1 style="font-size: 18px; margin-top: 30px;">TAHUN ANGGARAN {{ now()->translatedFormat('Y') }}</h1>

    </div>
  </div>

  <div class="page-break"></div>
  <div class="header">
    <h1>SPESIFIKASI TEKNIS PENGADAAN BARANG</h1>
  </div>

  <p style="text-transform: uppercase;">PEKERJAAN: {{ $need->title }}</p>

  <table>
    <tbody>
      @php
        $detailFields = [
            ['key' => 'background', 'label' => '1. Latar Belakang'],
            ['key' => 'purpose_and_objectives', 'label' => '2. Maksud & Tujuan'],
            ['key' => 'target_objective', 'label' => '3. Target / Sasaran Kegiatan'],
            ['key' => 'procurement_organization_name', 'label' => '4. Nama Organisasi Pengadaan'],
            ['key' => 'funding_source_id', 'label' => '5. Sumber Dana & Estimasi Biaya'],
            ['key' => 'implementation_period', 'label' => '6. Periode Pelaksanaan'],
            ['key' => 'expert_or_skilled_personnel', 'label' => '7. Tenaga Ahli / SDM Terampil'],
            ['key' => 'technical_specifications', 'label' => '8. Spesifikasi Teknis'],
            ['key' => 'training', 'label' => '9. Pelatihan'],
        ];
      @endphp

      @foreach ($detailFields as $field)
        <tr>
          <td style="text-transform: uppercase; width: 200px;">
            {{ $field['label'] }}
          </td>

          <td>
            <div class="content-value">
              @php
                $value = $detail ? $detail->{$field['key']} : null;
                if ($field['key'] === 'funding_source_id') {
                    $names = $detail && $detail->fundingSources ? $detail->fundingSources->pluck('name')->toArray() : [];
                    $joinedNames = '-';
                    if (count($names) > 0) {
                        if (count($names) === 1) {
                            $joinedNames = $names[0];
                        } else {
                            $last = array_pop($names);
                            $joinedNames = implode(', ', $names) . ' dan ' . $last;
                        }
                    }
                    echo '<ul style="list-style: none; padding-left: 0;">';
                    echo '<li>a. Sumber Dana</li>';
                    echo '<p style="margin-left: 15px; margin-bottom: 0;">' . e($joinedNames) . '</p>';
                    echo '<li style="margin-top: 4px;">b. Total perkiraan biaya:</li>';
                    echo '<p style="margin-left: 15px; margin-bottom: 0;">' . ($detail ? e($detail->estimated_cost) : '-') . '</p>';
                    echo '</ul>';
                } elseif ($field['key'] === 'procurement_organization_name') {
                    echo '<p style="margin-bottom: 4px;">Nama organisasi yang menyelenggarakan / melaksanakan pengadaan barang</p>';
                    echo '<ul style="list-style: none; padding-left: 0;">';
                    echo '<li>a. K/L/D/I</li>';
                    echo '<p style="margin-left: 15px; margin-bottom: 0;">' . ($detail ? e($detail->kldi) : '-') . '</p>';
                    echo '<li style="margin-top: 4px;">b. Satker/SKPD</li>';
                    echo '<p style="margin-left: 15px; margin-bottom: 0;">' . ($detail ? e($detail->satker_skpd) : '-') . '</p>';
                    echo '<li style="margin-top: 4px;">c. KPA</li>';
                    echo '<p style="margin-left: 15px; margin-bottom: 0;">' . ($detail && $detail->kpa ? e($detail->kpa->name) : '-') . '</p>';
                    echo '</ul>';
                } elseif (!$value) {
                    echo '<p>-</p>';
                } else {
                    $data = json_decode($value, true);
                    if (!$data || !isset($data['blocks'])) {
                        echo '<p>' . nl2br(e($value)) . '</p>';
                    } else {
                        foreach ($data['blocks'] as $block) {
                            if ($block['type'] === 'paragraph') {
                                echo '<p>' . ($block['data']['text'] ?? '') . '</p>';
                            } elseif ($block['type'] === 'header') {
                                $level = $block['data']['level'] ?? 2;
                                echo "<h{$level}>" . ($block['data']['text'] ?? '') . "</h{$level}>";
                            } elseif ($block['type'] === 'list' || $block['type'] === 'List') {
                                $isOrdered = ($block['data']['style'] ?? 'unordered') === 'ordered';
                                $tag = $isOrdered ? 'ol' : 'ul';
                                $start = $block['data']['start'] ?? ($block['data']['meta']['start'] ?? 1);
                                $type = $block['data']['meta']['counterType'] ?? ($block['data']['type'] ?? null);

                                $typeMap = [
                                    'decimal' => '1',
                                    'lower-alpha' => 'a',
                                    'upper-alpha' => 'A',
                                    'lower-roman' => 'i',
                                    'upper-roman' => 'I',
                                    'alpha' => 'a',
                                    'roman' => 'i',
                                ];
                                $htmlType = $typeMap[$type] ?? $type;
                                $typeAttr = $isOrdered && $htmlType ? " type=\"{$htmlType}\"" : '';
                                $startAttr = $isOrdered && $start != 1 ? " start=\"{$start}\"" : '';

                                echo "<{$tag}{$typeAttr}{$startAttr}>";
                                foreach ($block['data']['items'] ?? [] as $item) {
                                    $content = is_array($item) ? $item['content'] ?? '' : $item;
                                    echo "<li>{$content}</li>";
                                }
                                echo "</{$tag}>";
                            }
                        }
                    }
                }
              @endphp
            </div>
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <div class="signature-wrapper">
    <div class="signature-block">
      <p style="margin-bottom: 16px;">Donggala, {{ now()->translatedFormat('d F Y') }}</p>
      <p>RSUD KABELOTA</p>
      <p>KABUPATEN DONGGALA</p>
      <p>KUASA PENGGUNA ANGGARAN</p>

      <div class="signature-space"></div>
      <p class="signature-name">{{ $signer ? $signer->name : 'ARDIAN WIJAYA, S.T., M.T.' }}</p>
      <p>Nip. {{ $signer ? $signer->nip : '72731 0004345 1 001' }}</p>
    </div>
    <div style="clear: both;"></div>
  </div>
</body>

</html>
