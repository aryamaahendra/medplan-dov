import { ClipboardList, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { Need } from '../columns';
import { NeedStatusOverview } from './need-status-overview';

interface NeedSidebarProps {
  need: Need;
}

export function NeedSidebar({ need }: NeedSidebarProps) {
  return (
    <div className="space-y-4">
      <NeedStatusOverview need={need} />
    </div>
  );
}
