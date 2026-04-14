<?php

namespace App\Http\Controllers\Need;

use App\Actions\Need\AddNeedAttachmentAction;
use App\Actions\Need\DeleteNeedAttachmentAction;
use App\Http\Controllers\Controller;
use App\Models\Need;
use App\Models\NeedAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NeedAttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Need $need): Response
    {
        return Inertia::render('need/needs/attachments', [
            'need' => $need->load('attachments'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Need $need, AddNeedAttachmentAction $action): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:51200', 'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,zip,rar,mp4,webm,ogg'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'extension' => ['required', 'string'],
            'file_size' => ['required', 'integer'],
        ]);

        $action->execute($need, [
            'file' => $request->file('file'),
            'display_name' => $request->input('display_name'),
            'extension' => $request->input('extension'),
            'file_size' => $request->input('file_size'),
        ]);

        return back()->with('success', 'Lampiran berhasil diunggah.');
    }

    /**
     * Download the attachment.
     */
    public function download(NeedAttachment $attachment): StreamedResponse
    {
        if (! Storage::disk('local')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download(
            $attachment->file_path,
            $attachment->display_name
        );
    }

    /**
     * View the attachment inline.
     */
    public function view(NeedAttachment $attachment)
    {
        if (! Storage::disk('local')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->response($attachment->file_path);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NeedAttachment $attachment, DeleteNeedAttachmentAction $action): RedirectResponse
    {
        $action->execute($attachment);

        return back()->with('success', 'Lampiran berhasil dihapus.');
    }
}
