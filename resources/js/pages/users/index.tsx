import { Head } from '@inertiajs/react';

import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import users from '@/routes/users';
import { getUserColumns, type User } from './columns';

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    filters: DataTableFilters;
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
    const { setSearch, setSort, setPage, setPerPage, resetFilters } = useDataTable({
        only: ['users', 'filters'],
    });

    const columns = getUserColumns(filters, setSort);

    return (
        <>
            <Head title="Users" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage and browse all registered users.
                    </p>
                </div>

                <DataTable
                    columns={columns}
                    paginatedData={users}
                    filters={filters}
                    onSearch={setSearch}
                    onSort={setSort}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    onReset={resetFilters}
                    searchPlaceholder="Search by name or email..."
                />
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: users.index.url(),
        },
    ],
};
