<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Need;
use App\Models\NeedAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NeedAttachment>
 */
class NeedAttachmentFactory extends Factory
{
    protected $model = NeedAttachment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'need_id' => Need::factory(),
            'display_name' => fake()->sentence(3),
            'file_path' => 'attachments/'.fake()->uuid().'.pdf',
            'file_size' => fake()->numberBetween(1024, 10485760),
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
        ];
    }
}
