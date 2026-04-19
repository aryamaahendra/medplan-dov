<?php

namespace App\Http\Controllers\Need;

use App\Actions\Need\GetFilteredNeedsAction;
use App\Exports\NeedExport;
use App\Http\Controllers\Controller;
use App\Models\Need;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class NeedExportController extends Controller
{
    /**
     * Handle the export of filtered needs.
     */
    public function __invoke(Request $request, GetFilteredNeedsAction $action)
    {
        $this->authorize('viewAny', Need::class);

        $filters = [
            'year' => $request->input('year'),
            'status' => $request->input('status'),
            'need_type_id' => $request->input('need_type_id'),
            'organizational_unit_id' => $request->input('organizational_unit_id'),
            'urgency' => $request->input('urgency'),
            'impact' => $request->input('impact'),
            'is_priority' => $request->input('is_priority'),
            'is_approved_by_director' => $request->input('is_approved_by_director'),
            'min_checklist_score' => $request->input('min_checklist_score'),
            'need_group_id' => $request->input('need_group_id'),
        ];

        $query = $action->execute($filters, $request->user());

        // Apply search if present to match frontend list
        $search = $request->string('search')->trim()->value();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                foreach (['title', 'description'] as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        // Apply sorting to match default or current view
        $sort = $request->string('sort', 'created_at')->value();
        $direction = $request->string('direction', 'desc')->lower()->value();
        $query->orderBy($sort, $direction);

        return Excel::download(new NeedExport($query), 'daftar-usulan-kebutuhan.xlsx');
    }
}
