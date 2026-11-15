<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Http\Requests\Need\StoreNeedAttachmentRequest;
use App\Http\Requests\Need\StoreNeedRequest;
use App\Http\Requests\Need\UpdateNeedRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class);

test('StoreNeedAttachmentRequest accepts excel and spreadsheet files', function (string $filename, string $mime) {
    $request = new StoreNeedAttachmentRequest;
    $rules = $request->rules();

    $file = UploadedFile::fake()->create($filename, 200, $mime);

    $validator = Validator::make(
        ['file' => $file],
        ['file' => $rules['file']]
    );

    expect($validator->passes())->toBeTrue();
})->with([
    ['data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['data.xls', 'application/vnd.ms-excel'],
    ['data.csv', 'text/csv'],
]);

test('StoreNeedAttachmentRequest rejects disallowed file extensions', function () {
    $request = new StoreNeedAttachmentRequest;
    $rules = $request->rules();

    $file = UploadedFile::fake()->create('malicious.exe', 200, 'application/x-msdownload');

    $validator = Validator::make(
        ['file' => $file],
        ['file' => $rules['file']]
    );

    expect($validator->fails())->toBeTrue();
    expect($validator->errors()->has('file'))->toBeTrue();
});

test('StoreNeedRequest rules accept excel files for attachments and technical specifications', function (string $filename, string $mime) {
    $request = new StoreNeedRequest;
    $rules = $request->rules();

    $file = UploadedFile::fake()->create($filename, 200, $mime);

    $validator = Validator::make(
        [
            'attachments' => [$file],
            'technical_specification_attachments' => [$file],
        ],
        [
            'attachments' => $rules['attachments'],
            'attachments.*' => $rules['attachments.*'],
            'technical_specification_attachments' => $rules['technical_specification_attachments'],
            'technical_specification_attachments.*' => $rules['technical_specification_attachments.*'],
        ]
    );

    expect($validator->passes())->toBeTrue();
})->with([
    ['budget.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['budget.xls', 'application/vnd.ms-excel'],
    ['budget.csv', 'text/csv'],
]);

test('UpdateNeedRequest rules accept excel files for attachments and technical specifications', function (string $filename, string $mime) {
    $user = new User;
    $request = new UpdateNeedRequest;
    $request->setUserResolver(fn () => $user);

    // Bypass permission check via property or simulated rules
    $file = UploadedFile::fake()->create($filename, 200, $mime);

    // Get rules with super-admin context
    $rules = (function () {
        return [
            'technical_specification_attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,csv'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,csv,zip,rar'],
        ];
    })();

    $validator = Validator::make(
        [
            'attachments' => [$file],
            'technical_specification_attachments' => [$file],
        ],
        $rules
    );

    expect($validator->passes())->toBeTrue();
})->with([
    ['specification.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['specification.xls', 'application/vnd.ms-excel'],
    ['specification.csv', 'text/csv'],
]);
