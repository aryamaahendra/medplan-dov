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
    }

    .signature-block {
      float: right;
      width: 250px;
      text-align: center;
    }

    .signature-block p {
      margin: 0;
    }

    .signature-space {
      height: 70px;
    }

    .signature-name {
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      margin-top: 5px;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>SPESIFIKASI TEKNIS PENGADAAN BARANG</h1>
  </div>

  <p style="text-transform: uppercase;">PEKERJAAN: {{ $need->title }}</p>

  <table>
    <tbody>
      @php
        $detailFields = [
            ['key' => 'background', 'label' => '1. Latar Belakang'],
            ['key' => 'purpose_and_objectives', 'label' => '2. Tujuan dan Sasaran'],
            ['key' => 'target_objective', 'label' => '3. Target / Sasaran Kegiatan'],
            ['key' => 'procurement_organization_name', 'label' => '4. Nama Organisasi Pengadaan'],
            ['key' => 'funding_source_and_estimated_cost', 'label' => '5. Sumber Dana & Estimasi Biaya'],
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
                if (!$value) {
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
      <p>Jakarta, {{ now()->translatedFormat('F Y') }}</p>
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
