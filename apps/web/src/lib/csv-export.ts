/**
 * CSV export utility for admin pages
 * Generates and downloads a CSV file from data
 */
export function downloadCSV(data: Record<string, any>[], filename: string, columnLabels?: Record<string, string>) {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);
  const labels = columnLabels || {};
  const headers = keys.map(k => labels[k] || k);

  const escapeCell = (val: any): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(row => keys.map(k => escapeCell(row[k])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9-_]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
