<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super-admin';
    case Admin = 'admin';
    case Planner = 'planner';
    case UnitHead = 'unit-head';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::Planner => 'Planner',
            self::UnitHead => 'Unit Head',
            self::Staff => 'Staff',
        };
    }
}
