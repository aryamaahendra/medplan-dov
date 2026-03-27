---
description: How to implement a data table using Laravel, Inertia, and React
---

# Implementing a Data Table

When implementing a table in this application, follow these specific steps to ensure you use the best practices for Laravel and Inertia JS React.

1. **Create the Model, Migration, and Controller**
   If you are building a new entity, use the Artisan command to generate the foundational files, including a pest test and factory.
   ```bash
   php artisan make:model YourModel -a --pest
   ```
   *Tip: Always use the `laravel-best-practices` skill.*

2. **Define the Controller Logic**
   In your controller's `index` method, fetch the data using pagination. Apply filtering and sorting if necessary, and use `Inertia::render()` to return the view.
   ```php
   public function index()
   {
       $items = YourModel::query()->paginate(10);
       return Inertia::render('YourModel/Index', [
           'items' => $items,
       ]);
   }
   ```

3. **Define the Route**
   Register the named route in your `routes/web.php` so that Wayfinder can discover it.
   ```php
   Route::get('/items', [YourController::class, 'index'])->name('items.index');
   ```

4. **Generate Wayfinder Types**
   Run the Wayfinder generator to create typed route functions for your frontend.
   ```bash
   // turbo
   php artisan wayfinder:generate
   ```
   *Tip: Use the `wayfinder-development` skill.*

5. **Define the Columns in React**
   Create a `columns.tsx` file (e.g., in `resources/js/pages/YourModel/columns.tsx`) to declare the column structure. Use Tailwind CSS for any specialized column styling.
   *Tip: Use the `tailwindcss-development` skill.*

6. **Create the React Page Component**
   Create an `Index.tsx` file (e.g., in `resources/js/pages/YourModel/Index.tsx`). This component will receive the paginated data as an Inertia prop. Render your table UI, connecting it to the columns defined in step 5, and leverage Inertia links for pagination.
   *Tip: Use the `inertia-react-development` skill.*

7. **Format the Code and Run Tests**
   Always ensure your code is cleanly formatted and tests pass.
   ```bash
   // turbo-all
   vendor/bin/pint --format agent
   php artisan test --compact
   ```
   *Tip: Use the `pest-testing` skill.*
