import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCompactIDR,
  formatNumber,
  formatPercent,
} from '@/lib/formatters';

interface DashboardData {
  id: number;
  name: string;
  year: number;
  total_needs: number;
  total_budget: number;
  priority_needs: number;
  approved_by_director: number;
  avg_completeness: number;
}

export function DashboardGroupsTable({ data }: { data: DashboardData[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kelompok Usulan</TableHead>
            <TableHead className="text-right">Tahun</TableHead>
            <TableHead className="text-right">Total Usulan</TableHead>
            <TableHead className="text-right">Total Anggaran</TableHead>
            <TableHead className="text-right">Prioritas</TableHead>
            <TableHead className="text-right">Disetujui</TableHead>
            <TableHead className="text-right">Kelengkapan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell className="text-right">{group.year}</TableCell>
              <TableCell className="text-right">
                {formatNumber(group.total_needs)}
              </TableCell>
              <TableCell className="text-right">
                {formatCompactIDR(group.total_budget)}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(group.priority_needs)}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(group.approved_by_director)}
              </TableCell>
              <TableCell className="text-right">
                {formatPercent(group.avg_completeness)}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
