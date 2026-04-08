<?php

namespace App\Enums;

enum ChecklistAnswer: string
{
    case Yes = 'yes';
    case No = 'no';
    case NotApplicable = 'skip';
}
