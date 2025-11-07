import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'root' | 'admin' | 'supervisor' | 'unknown';

export const useRole = () => {
  const { user } = useAuth();
  
  const getUserRole = (): UserRole => {
    if (!user?.userTypeId) return 'unknown';
    // userTypeId 1 = Root, userTypeId 2 = Admin, userTypeId 3 = Supervisor
    if (user.userTypeId === 1) return 'root';
    if (user.userTypeId === 2) return 'admin';
    if (user.userTypeId === 3) return 'supervisor';
    return 'unknown';
  };

  const role = getUserRole();

  const isRoot = role === 'root';
  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor';
  const canEditPages = isRoot || isAdmin;
  const canEditPageTagsAndDomain = isRoot || isAdmin || isSupervisor;
  const canAddPages = isRoot || isAdmin || isSupervisor;
  const canViewLogs = isRoot || isAdmin || isSupervisor;
  const canDownloadLogs = isRoot || isAdmin || isSupervisor;
  const canManageUsers = isRoot; // Solo root puede gestionar usuarios

  return {
    role,
    isRoot,
    isAdmin,
    isSupervisor,
    canEditPages,
    canEditPageTagsAndDomain,
    canAddPages,
    canViewLogs,
    canDownloadLogs,
    canManageUsers,
  };
};
