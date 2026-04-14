<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedDetailsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_details')->delete();

        \DB::table('need_details')->insert([
            0 => [
                'id' => 1,
                'need_id' => 1,
                'background' => null,
                'purpose_and_objectives' => '{"time":1776081396805,"blocks":[{"id":"oj8AA-EBrQ","type":"List","data":{"style":"ordered","meta":{"counterType":"numeric"},"items":[{"content":"wqdqwdqdw\\\\","meta":{},"items":[]},{"content":"wrwrw","meta":{},"items":[]}]}}],"version":"2.31.6"}',
                'target_objective' => null,
                'procurement_organization_name' => null,
                'funding_source_and_estimated_cost' => null,
                'implementation_period' => null,
                'expert_or_skilled_personnel' => null,
                'technical_specifications' => null,
                'training' => null,
                'created_at' => '2026-04-13 11:53:32',
                'updated_at' => '2026-04-13 11:58:55',
            ],
            1 => [
                'id' => 2,
                'need_id' => 2,
                'background' => null,
                'purpose_and_objectives' => null,
                'target_objective' => null,
                'procurement_organization_name' => null,
                'funding_source_and_estimated_cost' => null,
                'implementation_period' => null,
                'expert_or_skilled_personnel' => null,
                'technical_specifications' => null,
                'training' => null,
                'created_at' => '2026-04-13 12:05:00',
                'updated_at' => '2026-04-13 12:05:00',
            ],
            2 => [
                'id' => 3,
                'need_id' => 3,
                'background' => null,
                'purpose_and_objectives' => null,
                'target_objective' => null,
                'procurement_organization_name' => null,
                'funding_source_and_estimated_cost' => null,
                'implementation_period' => null,
                'expert_or_skilled_personnel' => null,
                'technical_specifications' => null,
                'training' => null,
                'created_at' => '2026-04-13 12:08:39',
                'updated_at' => '2026-04-13 12:08:39',
            ],
        ]);

    }
}
