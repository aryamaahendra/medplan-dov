import { Link } from '@inertiajs/react';
import {
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  FolderGit2,
  LayoutGrid,
  Layers,
  Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import needTypes from '@/routes/need-types';
import needs from '@/routes/needs';
import organizationalUnits from '@/routes/organizational-units';
import renstras from '@/routes/renstras';
import users from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
  {
    title: 'Usulan Kebutuhan',
    href: needs.index.url(),
    icon: ClipboardList,
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
];

const footerNavItems: NavItem[] = [
  {
    title: 'Repository',
    href: 'https://github.com/laravel/react-starter-kit',
    icon: FolderGit2,
  },
  {
    title: 'Documentation',
    href: 'https://laravel.com/docs/starter-kits#react',
    icon: BookOpen,
  },
];

export function AppSidebar() {
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
        <NavMain items={masterNavItems} title="Master Data" />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
