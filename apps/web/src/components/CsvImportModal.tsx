'use client';

import { useState, useRef, useMemo, useCallback } from 'react';

/* ── Lightweight CSV Parser ── */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // skip next quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field.trim());
        field = '';
      } else if (ch === '\n') {
        current.push(field.trim());
        if (current.some(f => f.length > 0)) rows.push(current);
        current = [];
        field = '';
      } else if (ch === '\r') {
        // skip — handled by \n
      } else {
        field += ch;
      }
    }
  }
  // Last field
  current.push(field.trim());
  if (current.some(f => f.length > 0)) rows.push(current);

  return rows;
}

/* ── Field labels and auto-detect patterns ── */
const FIELD_DEFS: { key: string; label: string; patterns: string[]; required?: boolean }[] = [
  { key: 'name', label: 'Full Name', patterns: ['name', 'full name', 'customer name', 'client name', 'first name', 'fullname'], required: true },
  { key: 'email', label: 'Email', patterns: ['email', 'e-mail', 'mail', 'email address'], required: true },
  { key: 'phone', label: 'Phone', patterns: ['phone', 'telephone', 'tel', 'phone number', 'mobile', 'cell'] },
  { key: 'address', label: 'Address', patterns: ['address', 'street', 'address line 1', 'street address'], required: true },
  { key: 'city', label: 'City', patterns: ['city', 'town'], required: true },
  { key: 'state', label: 'State/Province', patterns: ['state', 'province', 'region', 'state/province'], required: true },
  { key: 'zip', label: 'ZIP/Postal Code', patterns: ['zip', 'postal', 'postcode', 'zip code', 'postal code', 'zip/postal'], required: true },
  { key: 'company', label: 'Company', patterns: ['company', 'organization', 'org', 'business', 'company name'] },
  { key: 'notes', label: 'Notes', patterns: ['notes', 'note', 'comment', 'remarks', 'description'] },
];

function autoDetectMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());

  for (const def of FIELD_DEFS) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (def.patterns.some(p => lowerHeaders[i] === p || lowerHeaders[i].startsWith(p) || lowerHeaders[i].includes(p))) {
        mapping[def.key] = i;
        break;
      }
    }
  }

  return mapping;
}

/* ── Props ── */
interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (clients: Record<string, string>[]) => void;
}

export default function CsvImportModal({ open, onClose, onImport }: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setRawRows([]);
    setHeaders([]);
    setDataRows([]);
    setMapping({});
    setImporting(false);
    setImported(0);
    setErrors([]);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.CSV')) {
      setErrors(['Please upload a .csv file. Export your Google Sheet or Excel as CSV first.']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) { setErrors(['Could not read file.']); return; }

      const rows = parseCSV(text);
      if (rows.length < 2) {
        setErrors(['File has no data rows. Make sure your CSV has a header row followed by data.']);
        return;
      }

      const h = rows[0];
      const d = rows.slice(1);
      setHeaders(h);
      setDataRows(d);
      setRawRows(rows);

      const autoMap = autoDetectMapping(h);
      setMapping(autoMap);

      // Check which required fields are missing
      const missing: string[] = [];
      for (const def of FIELD_DEFS) {
        if (def.required && autoMap[def.key] === undefined) {
          missing.push(def.label);
        }
      }
      setErrors(missing.length > 0
        ? [`Required columns not found: ${missing.join(', ')}. Map them manually below.`]
        : []
      );

      setStep('preview');
    };
    reader.onerror = () => setErrors(['Failed to read file.']);
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const updateMapping = useCallback((field: string, colIndex: number) => {
    setMapping(prev => ({ ...prev, [field]: colIndex }));
    // Clear errors when all required are mapped
    const required = FIELD_DEFS.filter(d => d.required);
    const allMapped = required.every(d => {
      const idx = field === d.key ? colIndex : mapping[d.key];
      return idx !== undefined && idx >= 0;
    });
    if (allMapped) setErrors([]);
  }, [mapping]);

  const previewRows = useMemo(() => dataRows.slice(0, 5), [dataRows]);

  const handleImport = useCallback(() => {
    // Validate required fields
    const required = FIELD_DEFS.filter(d => d.required);
    const missing = required.filter(d => mapping[d.key] === undefined || mapping[d.key] < 0);
    if (missing.length > 0) {
      setErrors([`Please map all required fields first: ${missing.map(d => d.label).join(', ')}`]);
      return;
    }

    setImporting(true);
    setErrors([]);

    // Build client objects
    const clients = dataRows.map((row) => {
      const client: Record<string, string> = {};
      for (const def of FIELD_DEFS) {
        const idx = mapping[def.key];
        if (idx !== undefined && idx >= 0 && idx < row.length) {
          client[def.key] = row[idx].trim();
        } else {
          client[def.key] = '';
        }
      }
      return client;
    }).filter(c => c.name.length > 0); // Skip rows without a name

    setImported(clients.length);
    onImport(clients);
    setStep('done');
    setImporting(false);
  }, [dataRows, mapping, onImport]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto" onClick={onClose}>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Import Clients</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 'upload' && 'Upload a CSV file exported from Google Sheets or Excel.'}
                {step === 'preview' && `Review and map your columns (${dataRows.length} rows found).`}
                {step === 'done' && `${imported} clients imported successfully.`}
              </p>
            </div>
            <button onClick={() => { reset(); onClose(); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-primary bg-blue-tint/40' : 'border-border hover:border-primary/40 hover:bg-blue-tint/20'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                <div className="w-14 h-14 rounded-2xl bg-blue-tint flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-foreground mb-1">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse · exported from Google Sheets or Excel</p>
              </div>
            )}

            {/* Step 2: Preview + Column Mapping */}
            {step === 'preview' && (
              <div className="space-y-4">
                {/* Errors */}
                {errors.length > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    {errors.map((e, i) => <p key={i}>{e}</p>)}
                  </div>
                )}

                {/* Column Mapping */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">Column Mapping</p>
                  <div className="space-y-2">
                    {FIELD_DEFS.map(def => {
                      const mappedCol = mapping[def.key];
                      return (
                        <div key={def.key} className="flex items-center gap-3 text-sm">
                          <span className="w-28 shrink-0 font-medium text-foreground">
                            {def.label} {def.required && <span className="text-red-400">*</span>}
                          </span>
                          <select
                            value={mappedCol !== undefined ? mappedCol : -1}
                            onChange={e => updateMapping(def.key, parseInt(e.target.value))}
                            className={`flex-1 h-9 px-3 rounded-xl border text-sm outline-none appearance-none cursor-pointer ${
                              mappedCol !== undefined && mappedCol >= 0
                                ? 'bg-white border-border text-foreground'
                                : 'bg-red-50 border-red-200 text-red-600'
                            }`}
                          >
                            <option value={-1} disabled>— Select column —</option>
                            {headers.map((h, i) => (
                              <option key={i} value={i}>{h}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Preview */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
                    Preview ({Math.min(5, dataRows.length)} of {dataRows.length} rows)
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted border-b border-border">
                          {headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="border-b border-border/50 last:border-0">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-2 text-xs text-foreground truncate max-w-[150px]">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Done */}
            {step === 'done' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-foreground mb-1">{imported} clients imported</p>
                <p className="text-sm text-muted-foreground">They're now available in your client list.</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 bg-white border-t border-border/50 flex items-center justify-between">
            <div className="text-xs text-muted-foreground/80">
              {step === 'upload' && 'Format: CSV with header row'}
              {step === 'preview' && 'Map all required fields (*) to proceed'}
              {step === 'done' && 'Ready to go'}
            </div>
            <div className="flex items-center gap-3">
              {step === 'preview' && (
                <button onClick={() => { reset(); }} className="h-10 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Start Over
                </button>
              )}
              {step === 'preview' && (
                <button onClick={handleImport} disabled={importing || errors.some(e => e.startsWith('Required'))} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  {importing ? 'Importing...' : `Import ${dataRows.length} Clients`}
                </button>
              )}
              {step === 'done' && (
                <button onClick={() => { reset(); onClose(); }} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
}
