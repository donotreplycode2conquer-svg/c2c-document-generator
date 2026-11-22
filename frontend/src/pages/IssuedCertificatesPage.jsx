import React, { useState, useEffect } from 'react';
import { certificateService } from '../services/certificateService';
import { offerLetterService } from '../services/offerLetterService';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { formatDateDisplay } from '../utils/formatters';
import { buildVerificationUrl } from '../utils/qrGenerator';
import {
  Search,
  Filter,
  Check,
  Copy,
  Eye,
  AlertOctagon,
  Download,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  XCircle
} from 'lucide-react';

export const IssuedCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrFilter, setQrFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedCert, setSelectedCert] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Revoked by administrator');
  const [isRevoking, setIsRevoking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificateService.getCertificates({
        search,
        status: statusFilter,
        qr: qrFilter,
        page,
        limit: 15
      });
      if (data.success) {
        setCertificates(data.certificates || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch certificates from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, statusFilter, qrFilter, page]);

  const handleCopyId = (certId) => {
    navigator.clipboard.writeText(certId);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenRevokeModal = (cert) => {
    setSelectedCert(cert);
    setRevokeReason('Discontinuation or violation of terms');
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedCert) return;
    setIsRevoking(true);
    try {
      const res = await certificateService.revokeCertificate(selectedCert.certificateId, revokeReason);
      if (res.success) {
        setRevokeModalOpen(false);
        fetchCertificates();
      }
    } catch (err) {
      alert('Revocation failed: ' + err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Official Registry
          </span>
          <h1 className="text-2xl font-bold text-navy-950">Issued Certificates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central registry of all issued internship completion certificates in MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={fetchCertificates}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-navy-900 text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, candidate, domain..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid Only</option>
              <option value="revoked">Revoked Only</option>
            </select>
          </div>

          {/* QR Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Type:</span>
            <select
              value={qrFilter}
              onChange={(e) => {
                setQrFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="all">All Certificates</option>
              <option value="qr">QR Code Enabled</option>
              <option value="non-qr">Without QR Code</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Querying MongoDB Atlas certificate registry...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-600 text-xs">
            <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <p className="text-slate-500 mt-1">
              Ensure MONGODB_URI is correctly configured in backend/.env
            </p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No certificates match the specified search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Certificate ID</th>
                  <th className="px-5 py-3.5">Candidate Name</th>
                  <th className="px-5 py-3.5">Domain</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Issue Date</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/70 transition">
                    {/* Certificate ID with Copy */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-navy-900">
                        <span>{cert.certificateId}</span>
                        <button
                          onClick={() => handleCopyId(cert.certificateId)}
                          className="p-1 text-slate-400 hover:text-navy-900 rounded"
                          title="Copy Certificate ID"
                        >
                          {copiedId === cert.certificateId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-navy-950">
                      {cert.holderName}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {cert.domain}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      {cert.duration}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDateDisplay(cert.issueDate)}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge type="qr" value={cert.qrEnabled} />
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge type="status" value={cert.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            setDetailsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {cert.status !== 'revoked' ? (
                          <button
                            onClick={() => handleOpenRevokeModal(cert)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                            title="Revoke Certificate"
                          >
                            <AlertOctagon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span
                            className="text-[10px] text-rose-500 font-medium px-1.5 py-0.5"
                            title={cert.revokedReason || 'Revoked by admin'}
                          >
                            Revoked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certificate Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Certificate Record Details"
        footer={
          <button
            onClick={() => setDetailsModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition"
          >
            Close
          </button>
        }
      >
        {selectedCert && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Certificate ID</span>
                <span className="text-base font-mono font-bold text-navy-950">{selectedCert.certificateId}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={buildVerificationUrl(selectedCert.certificateId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-navy-900 border border-slate-300 font-semibold hover:bg-slate-50 text-xs transition shadow-xs"
                >
                  <span>Verify Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </a>
                <StatusBadge type="status" value={selectedCert.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Candidate Full Name</span>
                <span className="font-semibold text-navy-900">{selectedCert.holderName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Program Track</span>
                <span className="font-semibold text-navy-900">{selectedCert.domain}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tenure / Duration</span>
                <span className="font-semibold text-navy-900">{selectedCert.duration}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">QR Code Feature</span>
                <span className="font-semibold text-navy-900">
                  {selectedCert.qrEnabled ? 'Enabled (Scannable URL)' : 'Disabled (Manual ID verification)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Start Date</span>
                <span className="font-semibold text-navy-900">{formatDateDisplay(selectedCert.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Completion Date</span>
                <span className="font-semibold text-navy-900">{formatDateDisplay(selectedCert.completionDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Issue Date</span>
                <span className="font-semibold text-navy-900">{formatDateDisplay(selectedCert.issueDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Signatory Designation</span>
                <span className="font-semibold text-navy-900">{selectedCert.signatoryDesignation || 'Authorized Signatory'}</span>
              </div>
            </div>

            {selectedCert.status === 'revoked' && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block text-[11px]">Revocation Audit Notice</span>
                <p className="mt-0.5">Revoked on: {formatDateDisplay(selectedCert.revokedAt)}</p>
                <p>Reason: {selectedCert.revokedReason || 'Unspecified'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        title="Revoke Certificate"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRevokeModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
            >
              {isRevoking ? 'Revoking in Atlas...' : 'Confirm Revocation'}
            </button>
          </div>
        }
      >
        {selectedCert && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Permanent Database Revocation</p>
                <p className="mt-0.5 text-xs text-rose-700">
                  Revoking certificate <strong className="font-mono">{selectedCert.certificateId}</strong> for <strong>{selectedCert.holderName}</strong> will immediately update the central MongoDB Atlas database.
                </p>
                <p className="mt-1 text-xs text-rose-700 font-semibold">
                  Any future public verification requests for this Certificate ID will immediately return status: REVOKED.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Revocation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Incomplete deliverables, administrative error, or code of conduct violation"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IssuedCertificatesPage;
