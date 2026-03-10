import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock, HardDrive } from 'lucide-react';
import { uploadDocument, listDocuments, deleteDocument } from '../services/api';
import toast from 'react-hot-toast';

const ALLOWED = { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const loadDocs = async () => {
    try {
      const { data } = await listDocuments();
      setDocs(data);
    } catch { /* silent */ }
  };

  useEffect(() => { loadDocs(); }, []);

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;
    const file = accepted[0];
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadDocument(fd, setProgress);
      toast.success(`✓ ${data.filename} indexed with ${data.chunk_count} chunks`);
      loadDocs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED,
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.original_filename}"? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      toast.success('Document deleted');
      setDocs(prev => prev.filter(d => d.id !== doc.id));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      ready:      { cls: 'badge-ready',      icon: <CheckCircle size={10} />, label: 'Ready' },
      processing: { cls: 'badge-processing', icon: <Clock size={10} />,       label: 'Processing' },
      failed:     { cls: 'badge-failed',     icon: <AlertCircle size={10} />, label: 'Failed' },
    };
    const s = map[status] || map.processing;
    return <span className={`badge ${s.cls}`}>{s.icon}{s.label}</span>;
  };

  return (
    <div className="main">
      <div className="section-title">Documents</div>
      <div className="section-sub">Upload documents to query with AI. Only you can see your documents.</div>

      <div style={{ marginTop: 24 }}>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-icon"><Upload size={36} /></div>
          {uploading ? (
            <>
              <div className="dropzone-text">Uploading & indexing…</div>
              <div className="progress-bar" style={{ maxWidth: 200, margin: '10px auto 0' }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="dropzone-hint" style={{ marginTop: 6 }}>{progress}%</div>
            </>
          ) : (
            <>
              <div className="dropzone-text">
                {isDragActive ? 'Drop your file here' : 'Drag & drop a file here, or click to browse'}
              </div>
              <div className="dropzone-hint">PDF, TXT, DOCX, MD — up to 20 MB</div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>
            Your Documents <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: '0.85rem' }}>({docs.length})</span>
          </span>
        </div>

        {docs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FileText size={48} /></div>
            <div className="empty-title">No documents yet</div>
            <div>Upload a document above to get started</div>
          </div>
        ) : (
          <div className="doc-list">
            {docs.map(doc => (
              <div key={doc.id} className="doc-item">
                <div className="doc-info">
                  <div className="doc-icon"><FileText size={22} /></div>
                  <div>
                    <div className="doc-name">{doc.original_filename}</div>
                    <div className="doc-meta">
                      {formatBytes(doc.file_size)} · {doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  {statusBadge(doc.status)}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                  >
                    <Trash2 size={13} />
                    {deletingId === doc.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
