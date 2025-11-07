import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/AuthContext';
import { usersService, User } from '@/services/usersService';
import { Download, Key, UserCog, RefreshCcw, Eye, EyeOff, Wand2, ShieldCheck } from 'lucide-react';

const Users = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { canManageUsers } = useRole();
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [userPasswords, setUserPasswords] = useState<Record<number, { password: string; visible: boolean }>>({});

  useEffect(() => {
    if (!canManageUsers) {
      navigate('/dashboard');
      return;
    }
  }, [canManageUsers, navigate]);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users...');
      try {
        const data = await usersService.getAll();
        console.log('Users loaded:', data);
        return data;
      } catch (err) {
        console.error('Error loading users:', err);
        throw err;
      }
    },
    enabled: canManageUsers,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      usersService.resetPassword(userId, password),
    onSuccess: () => {
      toast({
        title: 'Contraseña actualizada',
        description: 'La contraseña se ha cambiado exitosamente.',
      });

      setShowResetDialog(false);
      setNewPassword('');
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña.',
        variant: 'destructive',
      });
    },
  });

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetDialog(true);
  };

  const handleConfirmReset = () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    // Guardar la contraseña sin hashear para mostrar en la tabla
    setUserPasswords(prev => ({
      ...prev,
      [selectedUser.id]: { password: newPassword, visible: false }
    }));
    
    // Enviar la contraseña sin hashear - el backend se encargará del hashing
    resetPasswordMutation.mutate({
      userId: selectedUser.id,
      password: newPassword,
    });
  };

  const handleGeneratePassword = async () => {
    try {
      const pwd = await usersService.generatePassword();
      setNewPassword(pwd);
      setShowPasswordInput(true);
      toast({
        title: 'Contraseña generada',
        description: 'Puedes copiarla o editarla antes de guardar.',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'No se pudo generar la contraseña.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadCSV = async () => {
    if (!users || users.length === 0) {
      toast({
        title: 'No hay datos',
        description: 'No hay usuarios para exportar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const blob = await usersService.exportCSV();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Éxito',
        description: 'Usuarios exportados correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar los usuarios.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (userTypeId: number) => {
    if (userTypeId === 1) {
      return (
        <Badge variant="destructive" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
          Root
        </Badge>
      );
    }
    if (userTypeId === 2) {
      return (
        <Badge variant="destructive" className="bg-primary/10 text-primary border-primary/20">
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
        Supervisor
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-destructive">Error al cargar usuarios</p>
          <p className="text-muted-foreground text-sm">{(error as Error).message}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="h-8 w-8" />
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra usuarios y sus contraseñas
            </p>
          </div>
          <Button onClick={handleDownloadCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Contraseña Temporal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{getRoleBadge(user.userTypeId)}</TableCell>
                    <TableCell>
                      {userPasswords[user.id] ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {userPasswords[user.id].visible 
                              ? userPasswords[user.id].password 
                              : '••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setUserPasswords(prev => ({
                              ...prev,
                              [user.id]: { ...prev[user.id], visible: !prev[user.id].visible }
                            }))}
                          >
                            {userPasswords[user.id].visible ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUser?.id !== user.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          className="gap-2"
                        >
                          <Key className="h-4 w-4" />
                          Cambiar Contraseña
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          (Tu usuario)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              Cambiar la contraseña de {selectedUser?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="newPassword"
                  type={showPasswordInput ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-background/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPasswordInput((v) => !v)}
                  aria-label={showPasswordInput ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswordInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleGeneratePassword}
                  aria-label="Generar contraseña"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setNewPassword('');
                setSelectedUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReset}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users;
