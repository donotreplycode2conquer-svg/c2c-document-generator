import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerLetterService } from '../services/offerLetterService';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTimeDisplay } from '../utils/formatters';
import {
  FileText,
  Award,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Database
} from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await offerLetterService.getDashboardStats();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const s = stats?.stats || {
    totalOfferLetters: 0,
    totalCertificates: 0,
    qrCertificates: 0,
    nonQrCertificates: 0,
    revokedCertificates: 0,
    recentDocuments: []
  };

  const isDbOnline = stats?.dbStatus?.connected;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Administrator Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-950 mt-1">
            Code2Conquer Document & Verification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Generate corporate internship offer letters and completion certificates locally, while synchronizing official certificate records with the central verification database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/generate-offer-letter"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-gold-400" />
            <span>New Offer Letter</span>
          </Link>
          <Link
            to="/generate-certificate"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 text-xs font-bold hover:bg-gold-400 shadow-sm transition"
          >
            <Award className="w-4 h-4" />
            <span>Issue Certificate</span>
          </Link>
        </div>
      </div>

      {/* Database Alert Banner if offline */}
      {!loading && !isDbOnline && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">MongoDB Central Database is Offline</p>
              <p className="text-amber-800 mt-0.5">
                Offer letters can be generated offline, but official certificates must be registered with MongoDB Atlas before they can be verified on the public verification portal.
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 shrink-0 transition"
          >
            Configure Atlas
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Offer Letters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Offer Letters Generated</p>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">
              {loading ? '—' : s.totalOfferLetters}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 inline-block">Internal records</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Certificates Issued */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Certificates Issued</p>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">
              {loading ? '—' : s.totalCertificates}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 inline-block">
              {s.revokedCertificates > 0 ? `${s.revokedCertificates} revoked` : 'All valid'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Certificates with QR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">With Dynamic QR</p>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">
              {loading ? '—' : s.qrCertificates}
            </p>
            <span className="text-[11px] text-blue-600 font-medium mt-0.5 inline-block">
              Direct scan URL
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Certificates without QR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Without QR (Manual ID)</p>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">
              {loading ? '—' : s.nonQrCertificates}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 inline-block">Manual ID verified</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Recent Generated Documents</h2>
            <p className="text-xs text-slate-500">Audit log of latest offer letters and certificates.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/document-history"
              className="text-xs font-semibold text-navy-800 hover:text-navy-950 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading dashboard statistics...
          </div>
        ) : s.recentDocuments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No documents generated yet. Use the buttons above to generate your first offer letter or certificate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Document Type</th>
                  <th className="px-5 py-3">Candidate Name</th>
                  <th className="px-5 py-3">Document ID</th>
                  <th className="px-5 py-3">Domain Track</th>
                  <th className="px-5 py-3">Generation Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.recentDocuments.map((doc) => (
                  <tr key={doc._id || doc.documentId} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <StatusBadge type="docType" value={doc.documentType} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-navy-900">
                      {doc.candidateName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {doc.documentId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {doc.domain}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDateTimeDisplay(doc.createdAt || doc.issueDate)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {doc.documentType === 'CERTIFICATE' ? (
                        <Link
                          to="/issued-certificates"
                          className="text-xs font-semibold text-navy-700 hover:text-navy-950 hover:underline"
                        >
                          View In Registry
                        </Link>
                      ) : (
                        <Link
                          to="/document-history"
                          className="text-xs font-semibold text-navy-700 hover:text-navy-950 hover:underline"
                        >
                          View Details
                        </Link>
                      )}
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

export default DashboardPage;
