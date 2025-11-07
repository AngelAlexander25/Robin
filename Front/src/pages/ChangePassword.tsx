import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas nuevas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(formData);
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al cambiar la contraseña',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 rounded-full bg-primary/10 backdrop-blur-sm">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Cambiar Contraseña
          </h1>
          <p className="text-muted-foreground text-center">
            Actualiza tu contraseña de forma segura
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/70 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle>Nueva Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu contraseña actual y tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={formData.confirmNewPassword}
                  onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
