<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Models\Need;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class ExportNeedPdfController extends Controller
{
    private const string DEFAULT_PAPER_SIZE = 'a4';

    private const int DEFAULT_MARGIN_TOP = 20;

    private const int DEFAULT_MARGIN_BOTTOM = 20;

    private const int DEFAULT_MARGIN_LEFT = 30;

    private const int DEFAULT_MARGIN_RIGHT = 20;

    /**
     * Indonesia F4: 215mm x 330mm
     * points = mm * 72 / 25.4
     */
    private const array F4_PAPER_DIMENSIONS = [0, 0, 609.45, 935.43];

    public function __invoke(Need $need, Request $request): Response
    {
        $need->load([
            'detail.fundingSources',
            'detail.kpa',
            'organizationalUnit',
            'organizationalUnit.parentsRecursive',
            'needType',
        ]);

        $signer = null;
        if ($request->has('signer_id')) {
            $signer = User::find($request->input('signer_id'));
        }

        $paperSize = $request->input('paper_size', self::DEFAULT_PAPER_SIZE);
        $marginTop = $request->input('m_top', self::DEFAULT_MARGIN_TOP);
        $marginBottom = $request->input('m_bottom', self::DEFAULT_MARGIN_BOTTOM);
        $marginLeft = $request->input('m_left', self::DEFAULT_MARGIN_LEFT);
        $marginRight = $request->input('m_right', self::DEFAULT_MARGIN_RIGHT);

        $pdf = Pdf::loadView('pdf.need-detail', [
            'need' => $need,
            'detail' => $need->detail,
            'signer' => $signer,
            'marginTop' => $marginTop,
            'marginBottom' => $marginBottom,
            'marginLeft' => $marginLeft,
            'marginRight' => $marginRight,
        ]);

        if ($paperSize === 'f4') {
            $pdf->setPaper(self::F4_PAPER_DIMENSIONS);
        } else {
            $pdf->setPaper($paperSize);
        }

        if ($request->has('preview')) {
            return $pdf->stream("usulan-{$need->title}.pdf");
        }

        return $pdf->download("usulan-{$need->title}.pdf");
    }
}
