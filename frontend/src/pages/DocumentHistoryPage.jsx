import React, { useState, useEffect } from 'react';
import { offerLetterService } from '../services/offerLetterService';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTimeDisplay } from '../utils/formatters';
import { storage } from '../utils/storage';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Award,
  Download,
  Check,
  Copy
} from 'lucide-react';

export const DocumentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // all, OFFER_LETTER, CERTIFICATE
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await offerLetterService.getHistory({
        type: typeFilter,
        search
      });

      const dbHistory = data?.history || [];
      const offlineHistory = storage.getOfflineHistory();

      // Combine and deduplicate
      const combined = [...dbHistory];
      offlineHistory.forEach((off) => {
        if (!combined.some((item) => item.documentId === off.documentId)) {
          combined.push(off);
        }
      });

      setHistory(combined);
    } catch (err) {
      console.warn('DB history load failed, loading offline storage fallback:', err.message);
      setHistory(storage.getOfflineHistory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, search]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Administrative Audit
          </span>
          <h1 className="text-2xl font-bold text-navy-950">Document History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all generated offer letters and issued completion certificates.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-navy-900 text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name or Document ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-900"
          >
            <option value="all">All Document Types</option>
            <option value="OFFER_LETTER">Offer Letters Only</option>
            <option value="CERTIFICATE">Certificates Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Loading document history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Document Type</th>
                  <th className="px-5 py-3.5">Document ID</th>
                  <th className="px-5 py-3.5">Candidate Name</th>
                  <th className="px-5 py-3.5">Domain & Duration</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, idx) => (
                  <tr key={item._id || item.documentId || idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <StatusBadge type="docType" value={item.documentType} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-navy-900">
                        <span>{item.documentId}</span>
                        <button
                          onClick={() => handleCopyId(item.documentId)}
                          className="p-1 text-slate-400 hover:text-navy-900 rounded"
                          title="Copy ID"
                        >
                          {copiedId === item.documentId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-navy-950">
                      {item.candidateName}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      <div>{item.domain}</div>
                      <div className="text-[10px] text-slate-400">{item.duration}</div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDateTimeDisplay(item.createdAt || item.issueDate)}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge type="status" value={item.status || 'VALID'} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] text-slate-400">
                        Saved Locally
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentHistoryPage;
