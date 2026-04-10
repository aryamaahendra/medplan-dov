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
import { dashboard } from '@/routes';
import checklistQuestions from '@/routes/checklist-questions';
import kpis from '@/routes/kpis';
import needGroups from '@/routes/need-groups';
import needTypes from '@/routes/need-types';
import needs from '@/routes/needs';
import organizationalUnits from '@/routes/organizational-units';
import planningVersions from '@/routes/planning-versions';
import renstras from '@/routes/renstras';
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

const masterNavItems: NavItem[] = [
  {
    title: 'Users',
    href: users.index.url(),
    icon: Users,
  },
  {
    title: 'Unit Organisasi',
    href: organizationalUnits.index.url(),
    icon: Building2,
  },
  {
    title: 'Jenis Kebutuhan',
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
    title: 'Rencana Layanan Strategis',
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
  const { activeNeedGroups } = usePage<{
    activeNeedGroups: { id: number; name: string; year: number }[];
  }>().props;

  const dynamicNeedNavItems: NavItem[] = (activeNeedGroups || []).map(
    (group) => ({
      title: `${group.name} (${group.year})`,
      href: needs.index.url({ query: { need_group_id: group.id } }),
      icon: Pin,
    }),
  );

  dynamicNeedNavItems.push({
    title: 'Semua Usulan',
    href: needGroups.index.url(),
    icon: Database,
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
        <NavMain items={dynamicNeedNavItems} title="Usulan Kebutuhan" />
        <NavMain items={masterNavItems} title="Master Data" />
      </SidebarContent>

      <SidebarFooter>
        {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
