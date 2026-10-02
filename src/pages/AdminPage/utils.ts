import { MediaFormDraft } from './types';

export const exportToCSV = (filename: string, rows: (string | number)[][]) => {
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getOSBadge = (os: string) => {
  if (os.includes('Mac') || os.includes('iOS')) {
    return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  }
  if (os.includes('Windows')) {
    return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  }
  if (os.includes('Android')) {
    return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  }
  if (os.includes('Linux')) {
    return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  }
  return { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
};

const DRAFT_STORAGE_KEY = 'liveeuy_admin_media_form_draft';

export const saveMediaDraft = (draft: Partial<Omit<MediaFormDraft, 'savedAt'>> & { formTitle: string }): void => {
  try {
    const payload: MediaFormDraft = {
      ...draft,
      savedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Gagal menyimpan draft form:', err);
  }
};

export const loadMediaDraft = (): MediaFormDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearMediaDraft = (): void => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.error('Gagal menghapus draft form:', err);
  }
};
