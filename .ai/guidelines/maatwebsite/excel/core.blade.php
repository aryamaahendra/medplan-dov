# Laravel Excel

- Use `maatwebsite/excel` for spreadsheet exports, imports, queued work, CSV, PhpSpreadsheet in Laravel.
- Use explicit export/import classes with concerns; avoid ad-hoc generation in controllers, jobs, commands.
- Trigger `laravel-excel` skill for `Excel::download()`, `Excel::store()`, `Excel::queue()`, `Excel::raw()`, `Excel::import()`, `Excel::toArray()`, `Excel::toCollection()`, export/import concerns, queued jobs, validation, CSV settings, styling, events, formulas, charts, drawings, sheets, mapped cells, macros, config, cache, transactions, temp files, `Excel::fake()`.
- Check `references/package.md` feature matrix for broad docs, full-feature tasks, missing-feature audits.
- Large datasets: use `FromQuery` + queued exports, or `WithChunkReading` + `WithBatchInserts` for imports.
- Test intent with `Excel::fake()`. Inspect files only to verify cell contents, formatting, sheets, writer behavior.