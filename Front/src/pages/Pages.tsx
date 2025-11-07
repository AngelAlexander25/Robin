import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { pagesService, Page, CreatePageDto } from '@/services/pagesService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Power, PowerOff, FileText, Pencil } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useRole } from '@/hooks/useRole';

const Pages = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<CreatePageDto>({
    name: '',
    domain: '',
    selectors: '',
    tags: '',
    active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEditPages, canEditPageTagsAndDomain, canAddPages } = useRole();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: pagesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({ title: 'Success', description: 'Page created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create page',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => pagesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({ title: 'Success', description: 'Page updated successfully' });
      setIsDialogOpen(false);
      setEditingPage(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update page',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      selectors: '',
      tags: '',
      active: true,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: pagesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({ title: 'Page deleted successfully' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? pagesService.deactivate(id) : pagesService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({ title: 'Page status updated' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPage) {
      // Si está editando y solo tiene permisos limitados
      if (canEditPageTagsAndDomain && !canEditPages) {
        updateMutation.mutate({
          id: editingPage.id,
          data: {
            tags: formData.tags,
            domain: formData.domain,
          },
        });
      } else {
        updateMutation.mutate({
          id: editingPage.id,
          data: formData,
        });
      }
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      name: page.name,
      domain: page.domain,
      selectors: page.selectors,
      tags: page.tags,
      active: page.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (page: Page) => {
    toggleActiveMutation.mutate({ id: page.id, active: page.active });
  };

  const openAddDialog = () => {
    setEditingPage(null);
    resetForm();
    setIsDialogOpen(true);
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

  const isLimitedEdit = editingPage && canEditPageTagsAndDomain && !canEditPages;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pages</h1>
            <p className="text-muted-foreground">Manage your extension pages catalog</p>
          </div>
          {canAddPages && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md backdrop-blur-sm bg-card/95">
                <DialogHeader>
                  <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isLimitedEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selectors">Selectors</Label>
                    <Input
                      id="selectors"
                      placeholder=".class, #id, element"
                      value={formData.selectors}
                      onChange={(e) => setFormData({ ...formData, selectors: e.target.value })}
                      required
                      disabled={isLimitedEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="vuelos, travel, booking"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      required
                    />
                  </div>
                  {!isLimitedEdit && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingPage ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
              </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages?.map((page) => (
            <Card key={page.id} className="border-border shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/70">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{page.name}</CardTitle>
                  <div className="flex gap-2">
                    {(canEditPages || canEditPageTagsAndDomain) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(page)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canEditPages && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleActive(page)}
                          className={page.active ? 'text-success' : 'text-muted-foreground'}
                        >
                          {page.active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(page.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Domain</p>
                  <p className="text-sm font-medium text-foreground truncate">{page.domain}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Selectors</p>
                  <p className="text-sm font-mono text-foreground truncate">{page.selectors}</p>
                </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {page.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge variant={page.active ? 'default' : 'outline'}>
                      {page.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pages?.length === 0 && (
          <Card className="border-border shadow-md backdrop-blur-sm bg-card/70">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No pages yet</h3>
              <p className="text-muted-foreground">Get started by creating your first page</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Pages;
