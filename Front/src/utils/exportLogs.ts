import { Log } from '@/services/logsService';

export const exportLogsToCSV = (logs: Log[]) => {
  const headers = [
    'ID',
    'Extension',
    'Asesor',
    'Call Ref',
    'Page',
    'Domain',
    'Total Duration (s)',
    'Pause Count',
    'Total Pause Time (s)',
    'Start Time',
    'End Time',
    'User Agent',
  ];

  const rows = logs.map(log => [
    log.id,
    log.extension || '',
    log.asesor || '',
    log.callRef || '',
    log.page?.name || '',
    log.page?.domain || '',
    log.totalDuration || '',
    log.pauseCount || '',
    log.totalPauseTime || '',
    log.startTime,
    log.endTime,
    log.userAgent || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `logs_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
