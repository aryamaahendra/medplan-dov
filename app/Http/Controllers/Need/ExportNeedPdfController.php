<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Models\Need;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ExportNeedPdfController extends Controller
{
    public function __invoke(Need $need, Request $request)
    {
        $need->load([
            'detail',
            'organizationalUnit',
            'organizationalUnit.parentsRecursive',
            'needType',
        ]);

        $pdf = Pdf::loadView('pdf.need-detail', [
            'need' => $need,
            'detail' => $need->detail,
        ]);

        $pdf->setPaper('a4');

        if ($request->has('preview')) {
            return $pdf->stream("usulan-{$need->title}.pdf");
        }

        return $pdf->download("usulan-{$need->title}.pdf");
    }
}
