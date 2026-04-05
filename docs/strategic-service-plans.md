# Strategic Service Plans (Renstra Pelayanan)

The Strategic Service Plan module manages the long-term strategic programs, service plans, and targets for the hospital, typically organized by year.

## Table: `strategic_service_plans`

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `unsignedBigInteger` | No | Primary key |
| `year` | `unsignedSmallInteger` | No | Year of the strategic plan (Check: >= 2000) |
| `strategic_program` | `string(255)` | No | Name of the strategic program |
| `service_plan` | `text` | No | Details of the service plan |
| `target` | `text` | No | Target outcomes or objectives |
| `policy_direction` | `text` | No | Relevant policy directions |
| `created_at` | `timestamp` | Yes | Creation timestamp |
| `updated_at` | `timestamp` | Yes | Last update timestamp |
| `deleted_at` | `timestamp` | Yes | Soft delete timestamp |

## Backend Components

### Model: `App\Models\StrategicServicePlan`
- **Traits**: `HasFactory`, `SoftDeletes`
- **Fillable**: `year`, `strategic_program`, `service_plan`, `target`, `policy_direction`

### Controller: `App\Http\Controllers\StrategicServicePlanController`
Handles CRUD operations and provides data for the frontend via Inertia.
- **index**: Lists plans with search and sort capabilities.
- **store**: Saves a new plan.
- **update**: Updates an existing plan.
- **destroy**: Soft deletes a plan.

### Form Requests
- `App\Http\Requests\StoreStrategicServicePlanRequest`
- `App\Http\Requests\UpdateStrategicServicePlanRequest`

### Seeder: `Database\Seeders\StrategicServicePlanSeeder`
Seeds the database with initial strategic plan data for years 2025-2029.

## Endpoints

| Method | URI | Action | Route Name |
| :--- | :--- | :--- | :--- |
| GET | `/strategic-service-plans` | index | `strategic-service-plans.index` |
| POST | `/strategic-service-plans` | store | `strategic-service-plans.store` |
| PUT/PATCH | `/strategic-service-plans/{strategic_service_plan}` | update | `strategic-service-plans.update` |
| DELETE | `/strategic-service-plans/{strategic_service_plan}` | destroy | `strategic-service-plans.destroy` |

## Testing

Run focused tests using Sail:
```bash
./vendor/bin/sail artisan test --filter=StrategicServicePlanControllerTest
```
