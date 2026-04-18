import { Link, usePage } from '@inertiajs/react';
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutGrid,
  Layers,
  Users,
  BookKey,
  Database,
  Pin,
  ListChecks,
  ShieldUser,
  UserKey,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import { dashboard } from '@/routes';
import checklistQuestions from '@/routes/checklist-questions';
import kpis from '@/routes/kpis';
import needGroups from '@/routes/need-groups';
import needTypes from '@/routes/need-types';
import needs from '@/routes/needs';
import organizationalUnits from '@/routes/organizational-units';
import permissions from '@/routes/permissions';
import planningVersions from '@/routes/planning-versions';
import renstras from '@/routes/renstras';
import roles from '@/routes/roles';
import strategicServicePlans from '@/routes/strategic-service-plans';
import users from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
];

const userRole: NavItem[] = [
  {
    title: 'Users',
    href: users.index.url(),
    icon: Users,
  },
  {
    title: 'Roles',
    href: roles.index.url(),
    icon: ShieldUser,
  },
  {
    title: 'Permissions',
    href: permissions.index.url(),
    icon: UserKey,
  },
];

const masterNavItems: NavItem[] = [
  {
    title: 'Unit Kerja',
    href: organizationalUnits.index.url(),
    icon: Building2,
  },
  {
    title: 'Kategori Kebutuhan',
    href: needTypes.index.url(),
    icon: Layers,
  },
  {
    title: 'Manajemen Renstra',
    href: renstras.index.url(),
    icon: FileText,
  },
  {
    title: 'Manajemen IKK',
    href: kpis.groups.index.url(),
    icon: BookKey,
  },
  {
    title: 'Rencana Pengembangan Layanan Strategis',
    href: strategicServicePlans.index.url(),
    icon: ListChecks,
  },
  {
    title: 'Bank Pertanyaan Checklist',
    href: checklistQuestions.index.url(),
    icon: ClipboardList,
  },
  {
    title: 'Versi Perencanaan',
    href: planningVersions.index.url(),
    icon: ClipboardList,
  },
];

// const footerNavItems: NavItem[] = [
//   {
//     title: 'Repository',
//     href: 'https://github.com/laravel/react-starter-kit',
//     icon: FolderGit2,
//   },
//   {
//     title: 'Documentation',
//     href: 'https://laravel.com/docs/starter-kits#react',
//     icon: BookOpen,
//   },
// ];

export function AppSidebar() {
  const { hasPermission } = usePermission();
  const { activeNeedGroups } = usePage<{
    activeNeedGroups: { id: number; name: string; year: number }[];
  }>().props;

  const dynamicNeedNavItems: NavItem[] = hasPermission('view any needs')
    ? (activeNeedGroups || []).map((group) => ({
        title: `${group.name} (${group.year})`,
        href: needs.index.url({ query: { need_group_id: group.id } }),
        icon: Pin,
      }))
    : [];

  if (hasPermission('view any needs')) {
    dynamicNeedNavItems.push({
      title: 'Semua Usulan',
      href: needGroups.index.url(),
      icon: Database,
    });
  }

  const filteredMasterNavItems = masterNavItems.filter((item) => {
    switch (item.title) {
      case 'Unit Kerja':
        return hasPermission('view any organizational-units');
      case 'Kategori Kebutuhan':
        return hasPermission('view any need-types');
      case 'Manajemen Renstra':
        return hasPermission('view any renstras');
      case 'Manajemen IKK':
        return hasPermission('view any kpi-groups');
      case 'Rencana Pengembangan Layanan Strategis':
        return hasPermission('view any strategic-service-plans');
      case 'Bank Pertanyaan Checklist':
        return hasPermission('view any checklist-questions');
      case 'Versi Perencanaan':
        return hasPermission('view any planning-versions');
      default:
        return true;
    }
  });

  const filteredUserRole = userRole.filter((item) => {
    switch (item.title) {
      case 'Users':
        return hasPermission('view any users');
      case 'Roles':
        return hasPermission('view any roles');
      case 'Permissions':
        return hasPermission('view any permissions');
      default:
        return true;
    }
  });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} title="Main Menu" />
        {dynamicNeedNavItems.length > 0 && (
          <NavMain items={dynamicNeedNavItems} title="Usulan Kebutuhan" />
        )}
        {filteredMasterNavItems.length > 0 && (
          <NavMain items={filteredMasterNavItems} title="Master Data" />
        )}
        {filteredUserRole.length > 0 && (
          <NavMain items={filteredUserRole} title="User & Role" />
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
