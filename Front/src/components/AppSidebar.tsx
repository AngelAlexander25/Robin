import { LayoutDashboard, FileText, Activity, LogOut, UserCog } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['root', 'admin', 'supervisor'] },
  { title: 'Pages', url: '/pages', icon: FileText, roles: ['root', 'admin', 'supervisor'] },
  { title: 'Logs', url: '/logs', icon: Activity, roles: ['root', 'admin', 'supervisor'] },
  { title: 'Usuarios', url: '/users', icon: UserCog, roles: ['root'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const { role } = useRole();
  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    await logout();
  };

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              A
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && user && (
          <div className="mb-2 text-sm text-sidebar-foreground">
            <p className="font-medium">{user.name} {user.lastName}</p>
            <p className="text-xs text-sidebar-foreground/60">@{user.userName}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
