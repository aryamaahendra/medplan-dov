<?php

declare(strict_types=1);

/*
 * Architecture tests for the project-structure skill.
 *
 * Requires Pest 2+ (arch() is built in). Install as tests/Feature/ArchTest.php.
 * Keep it in tests/Feature, not tests/Unit: the frontend checks below call
 * app_path() / resource_path() and need the Laravel application booted.
 */

// ---------------------------------------------------------------------------
// Helpers (guarded so they never collide with other test files)
// ---------------------------------------------------------------------------

if (! function_exists('archJsFiles')) {
    /** @return list<string> */
    function archJsFiles(string $dir): array
    {
        if (! is_dir($dir)) {
            return [];
        }

        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['ts', 'tsx', 'js', 'jsx'], true)) {
                $files[] = str_replace('\\', '/', $file->getPathname());
            }
        }

        return $files;
    }
}

if (! function_exists('archRelative')) {
    function archRelative(string $path): string
    {
        return ltrim(str_replace(str_replace('\\', '/', base_path()), '', $path), '/');
    }
}

if (! function_exists('archRuntimeFeatureImports')) {
    /**
     * Feature domains imported at runtime by the given source (`import type` excluded).
     * The pattern cannot cross a quote character, so it never spans two statements.
     *
     * @return list<string>
     */
    function archRuntimeFeatureImports(string $code): array
    {
        preg_match_all('#^import\s+(?!type\b)[^\'"]*?from\s+[\'"]@/features/([^/\'"]+)#m', $code, $matches);

        return $matches[1];
    }
}

// ---------------------------------------------------------------------------
// Backend layering (static analysis via Pest's arch())
// ---------------------------------------------------------------------------

arch('Controllers must be final')
    ->expect('App\Http\Controllers')
    ->toBeFinal()
    ->ignoring('App\Http\Controllers\Controller');

arch('Policies must be final')
    ->expect('App\Policies')
    ->toBeFinal();

arch('Actions must be suffixed with Action')
    ->expect('App\Actions')
    ->toHaveSuffix('Action')
    ->ignoring('App\Actions\Fortify');

arch('Actions must expose a handle() method')
    ->expect('App\Actions')
    ->toHaveMethod('handle')
    ->ignoring('App\Actions\Fortify');

arch('Actions must not be final so tests can mock them')
    ->expect('App\Actions')
    ->not->toBeFinal()
    ->ignoring('App\Actions\Fortify');

// UploadedFile is deliberately NOT listed: Actions may process uploads.
arch('Actions must stay HTTP-agnostic')
    ->expect('App\Actions')
    ->not->toUse([
        'App\Http',
        'Illuminate\Http\Request',
        'Illuminate\Http\Response',
        'Illuminate\Http\JsonResponse',
        'Illuminate\Http\RedirectResponse',
        'Illuminate\Foundation\Http\FormRequest',
        'Inertia\Inertia',
        'redirect',
        'to_route',
        'auth',
    ]);

test('legacy Services and Repositories layers must not exist', function () {
    expect(is_dir(app_path('Services')))->toBeFalse('app/Services must not exist; business logic belongs in app/Actions');
    expect(is_dir(app_path('Repositories')))->toBeFalse('app/Repositories must not exist; use Eloquent scopes');
});

test('models must not define their own __construct', function () {
    expect(true)->toBeTrue();

    foreach (glob(app_path('Models/*.php')) ?: [] as $file) {
        $class = 'App\\Models\\'.pathinfo($file, PATHINFO_FILENAME);

        if (! class_exists($class)) {
            continue;
        }

        $reflection = new ReflectionClass($class);

        if ($reflection->isAbstract()) {
            continue;
        }

        $hasOwnConstructor = false;
        foreach ($reflection->getMethods() as $method) {
            if ($method->getName() === '__construct' && $method->getFileName() === realpath($file)) {
                $hasOwnConstructor = true;

                break;
            }
        }

        expect($hasOwnConstructor)->toBeFalse("Model {$class} must not override __construct");
    }
});

arch('No debug helpers in App classes')
    ->expect('App')
    ->not->toUse(['dd', 'dump', 'var_dump', 'ray']);

arch('env() must not be called directly in App classes')
    ->expect('App')
    ->not->toUse('env');

// ---------------------------------------------------------------------------
// Frontend boundaries (Pest arch() only sees PHP, so these scan the TS files)
// ---------------------------------------------------------------------------

test('shared frontend layers must not import from features', function () {
    $violations = [];

    foreach (['components', 'layouts', 'hooks', 'types', 'stores', 'lib'] as $layer) {
        foreach (archJsFiles(resource_path("js/{$layer}")) as $path) {
            if (preg_match('#from\s+[\'"]@/features(?:/|[\'"])#', (string) file_get_contents($path), $match)) {
                $violations[] = archRelative($path).': '.$match[0];
            }
        }
    }

    expect($violations)->toBeEmpty('Shared layers must never import from @/features/*: '.implode(', ', $violations));
});

test('features must not import runtime code from sibling features', function () {
    $violations = [];

    foreach (glob(resource_path('js/features/*'), GLOB_ONLYDIR) ?: [] as $featureDir) {
        $domain = basename($featureDir);

        foreach (archJsFiles($featureDir) as $path) {
            foreach (archRuntimeFeatureImports((string) file_get_contents($path)) as $target) {
                if ($target !== $domain) {
                    $violations[] = archRelative($path)." imports runtime code from feature '{$target}'";
                }
            }
        }
    }

    expect($violations)->toBeEmpty('Features may only `import type` from sibling features: '.implode(', ', $violations));
});

test('a page must not import runtime code from more than one feature', function () {
    $violations = [];

    foreach (archJsFiles(resource_path('js/pages')) as $path) {
        $domains = array_unique(archRuntimeFeatureImports((string) file_get_contents($path)));

        if (count($domains) > 1) {
            $violations[] = archRelative($path).' ('.implode(', ', $domains).')';
        }
    }

    expect($violations)->toBeEmpty('Pages belong to one domain: '.implode(', ', $violations));
});

test('pages must stay thin composers of at most 100 non-blank lines', function () {
    $violations = [];

    foreach (archJsFiles(resource_path('js/pages')) as $path) {
        // Nested domain components within page folders are not page composers
        if (str_contains($path, '/components/')) {
            continue;
        }

        // Strip import statements (including multi-line ones), then count non-blank lines.
        $code = (string) preg_replace('#^import\s[^\'"]*[\'"][^\'"]*[\'"];?#m', '', (string) file_get_contents($path));
        $lines = array_filter(preg_split('/\R/', $code) ?: [], fn (string $line): bool => trim($line) !== '');

        if (count($lines) > 100) {
            $violations[] = archRelative($path).' ('.count($lines).' lines)';
        }
    }

    expect($violations)->toBeEmpty('Extract page logic into hooks/components: '.implode(', ', $violations));
});
