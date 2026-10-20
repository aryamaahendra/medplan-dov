<?php

declare(strict_types=1);

namespace App\DTOs\Need;

final readonly class DirectorDetermination
{
    public function __construct(
        public ?float $approvedVolume = null,
        public ?float $approvedUnitPrice = null,
        public bool $isRecommendedForNextCycle = false,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            approvedVolume: isset($data['approved_volume']) && $data['approved_volume'] !== ''
                ? (float) $data['approved_volume']
                : null,
            approvedUnitPrice: isset($data['approved_unit_price']) && $data['approved_unit_price'] !== ''
                ? (float) $data['approved_unit_price']
                : null,
            isRecommendedForNextCycle: (bool) ($data['is_recommended_for_next_cycle'] ?? false),
        );
    }
}
