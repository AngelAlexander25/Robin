import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Key, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useRole } from '@/hooks/useRole';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <img src={logo} alt="AdminRobin" className="h-8 w-auto" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">AdminRobin</h2>
                <p className="text-xs text-muted-foreground">Extension Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-accent">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {user?.name} {user?.lastName}
                      </span>
                      <Badge 
                        variant={role === 'root' ? 'destructive' : role === 'admin' ? 'default' : 'secondary'} 
                        className={`text-xs ${role === 'root' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}`}
                      >
                        {role === 'root' ? 'Root' : role === 'admin' ? 'Admin' : 'Supervisor'}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {role === 'root' && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => navigate('/change-password')}
                        className="cursor-pointer"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Cambiar Contraseña
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
