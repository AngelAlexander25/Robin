import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { logsService } from '@/services/logsService';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/hooks/use-toast';
import { exportLogsToCSV } from '@/utils/exportLogs';

const Logs = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { canDownloadLogs } = useRole();
  const { toast } = useToast();

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['logs', page],
    queryFn: () => logsService.getPaginated(page, pageSize),
  });

  const handleDownload = async () => {
    try {
      const allLogs = await logsService.getAll();
      exportLogsToCSV(allLogs);
      toast({
        title: 'Success',
        description: 'Logs exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export logs',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Logs</h1>
            <p className="text-muted-foreground">View all extension activity logs</p>
          </div>
          {canDownloadLogs && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        <Card className="border-border shadow-md backdrop-blur-sm bg-card/70">
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Extension</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Call Ref</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Pauses</TableHead>
                    <TableHead>Start Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData?.items && logsData.items.length > 0 ? (
                    logsData.items.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.extension}</TableCell>
                        <TableCell>{log.asesor}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.callRef}</Badge>
                        </TableCell>
                        <TableCell>{log.page?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDuration(log.totalDuration)}</TableCell>
                        <TableCell>
                          {log.pauseCount || 0}
                          {log.totalPauseTime ? ` (${formatDuration(log.totalPauseTime)})` : ''}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(log.startTime)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {logsData && logsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {logsData.pageNumber} of {logsData.totalPages} ({logsData.totalCount} total logs)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= logsData.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
