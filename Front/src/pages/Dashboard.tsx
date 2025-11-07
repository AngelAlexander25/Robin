import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services/dashboardService';
import { Activity, FileText, CheckCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => dashboardService.getRecentLogs(5),
  });

  const statsCards = [
    {
      title: 'Total Logs',
      value: stats?.totalLogs || 0,
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: 'Total Pages',
      value: stats?.totalPages || 0,
      icon: FileText,
      color: 'text-accent',
    },
    {
      title: 'Active Pages',
      value: stats?.activePages || 0,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Today Logs',
      value: stats?.todayLogs || 0,
      icon: TrendingUp,
      color: 'text-warning',
    },
  ];

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your extension activity</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="border-border shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border shadow-md backdrop-blur-sm bg-card/70">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log: any, index: number) => (
                  <div
                    key={log.id || index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {log.page?.name || 'Unknown Page'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Asesor: {log.asesor || 'N/A'} • Call Ref: {log.callRef || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {log.totalDuration ? `${log.totalDuration}s` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
