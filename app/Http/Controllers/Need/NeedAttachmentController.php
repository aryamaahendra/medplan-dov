<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\NeedProposalEngine;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedAttachmentRequest;
use App\Models\Need;
use App\Models\NeedAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class NeedAttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Need $need): Response
    {
        $this->authorize('view', $need);

        return Inertia::render('need/needs/attachments', [
            'need' => $need->load(['attachments', 'needGroup']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNeedAttachmentRequest $request, Need $need, NeedProposalEngine $engine): RedirectResponse
    {
        $this->authorize('create', [NeedAttachment::class, $need]);

        $file = $request->file('file');

        $engine->addAttachment($need, [
            'file' => $file,
            'category' => $request->input('category', 'general'),
            'display_name' => $request->input('display_name'),
            'extension' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
        ]);

        return back()->with('success', 'Lampiran berhasil diunggah.');
    }

    /**
     * Download the attachment.
     */
    public function download(NeedAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $attachment->need);

        $disk = config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        if (! Storage::disk($disk)->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk($disk)->download(
            $attachment->file_path,
            $attachment->display_name
        );
    }

    /**
     * View the attachment inline.
     */
    public function view(NeedAttachment $attachment): SymfonyResponse
    {
        $this->authorize('view', $attachment->need);

        $disk = config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        if (! Storage::disk($disk)->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk($disk)->response($attachment->file_path);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NeedAttachment $attachment, NeedProposalEngine $engine): RedirectResponse
    {
        $this->authorize('delete', $attachment);
        $engine->deleteAttachment($attachment);

        return back()->with('success', 'Lampiran berhasil dihapus.');
    }
}
