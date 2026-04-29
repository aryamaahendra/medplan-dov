<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Models\Need;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ExportNeedPdfController extends Controller
{
    public function __invoke(Need $need, Request $request)
    {
        $need->load([
            'detail.fundingSources',
            'organizationalUnit',
            'organizationalUnit.parentsRecursive',
            'needType',
        ]);

        $signer = null;
        if ($request->has('signer_id')) {
            $signer = User::find($request->input('signer_id'));
        }

        $paperSize = $request->input('paper_size', 'a4');
        $marginTop = $request->input('m_top', 20);
        $marginBottom = $request->input('m_bottom', 20);
        $marginLeft = $request->input('m_left', 30);
        $marginRight = $request->input('m_right', 20);

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
            // Indonesia F4: 215mm x 330mm
            // points = mm * 72 / 25.4
            $pdf->setPaper([0, 0, 609.45, 935.43]);
        } else {
            $pdf->setPaper($paperSize);
        }

        if ($request->has('preview')) {
            return $pdf->stream("usulan-{$need->title}.pdf");
        }

        return $pdf->download("usulan-{$need->title}.pdf");
    }
}
