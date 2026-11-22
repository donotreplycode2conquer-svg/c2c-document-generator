import React, { useState, useEffect } from 'react';
import { calculateEndDate } from '../../utils/formatters';
import {
  QrCode,
  ShieldCheck,
  RefreshCw,
  Award,
  Printer,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

const STANDARD_DOMAINS = [
  'Web Development',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Java Development',
  'Python Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Cybersecurity',
  'Cloud Computing',
  'Data Analytics',
  'Custom Domain'
];

const STANDARD_DURATIONS = [
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
  'Custom Duration'
];

export const CertificateForm = ({
  formData,
  onChange,
  onIssue,
  onPrint,
  onReset,
  onRefreshId,
  isIssuing = false,
  dbConnected = false,
  error = null
}) => {
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  useEffect(() => {
    if (formData.domain && !STANDARD_DOMAINS.slice(0, -1).includes(formData.domain)) {
      setIsCustomDomain(true);
    }
    if (formData.duration && !STANDARD_DURATIONS.slice(0, -1).includes(formData.duration)) {
      setIsCustomDuration(true);
    }
  }, []);

  const handleDomainSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Custom Domain') {
      setIsCustomDomain(true);
      onChange({ ...formData, domain: '' });
    } else {
      setIsCustomDomain(false);
      onChange({ ...formData, domain: val });
    }
  };

  const handleDurationSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Custom Duration') {
      setIsCustomDuration(true);
      onChange({ ...formData, duration: '' });
    } else {
      setIsCustomDuration(false);
      const computedEnd = calculateEndDate(formData.startDate, val);
      onChange({
        ...formData,
        duration: val,
        completionDate: computedEnd || formData.completionDate
      });
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    const computedEnd = calculateEndDate(newStart, formData.duration);
    onChange({
      ...formData,
      startDate: newStart,
      completionDate: computedEnd || formData.completionDate
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onIssue();
      }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-navy-900">Certificate Configuration</h2>
          <p className="text-xs text-slate-500">Live preview updates automatically as you type.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Database Warning if offline */}
      {!dbConnected && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">MongoDB Atlas Disconnected</p>
            <p className="text-amber-700 mt-0.5">
              Certificate records must be registered in the central cloud database to be valid for online verification. Please configure your MONGODB_URI in Settings.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* QR Code Option Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Certificate Type Selection <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...formData, qrEnabled: true })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
              formData.qrEnabled
                ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <QrCode className={`w-4 h-4 ${formData.qrEnabled ? 'text-gold-400' : 'text-slate-400'}`} />
            <span>With QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...formData, qrEnabled: false })}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
              !formData.qrEnabled
                ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Award className={`w-4 h-4 ${!formData.qrEnabled ? 'text-gold-400' : 'text-slate-400'}`} />
            <span>Without QR Code</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {formData.qrEnabled
            ? 'Includes dynamic QR code linking directly to public verification URL.'
            : 'Generates clean certificate with Certificate ID for manual verification on website.'}
        </p>
      </div>

      {/* Candidate Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Candidate Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Jane Doe"
          value={formData.candidateName || ''}
          onChange={(e) => onChange({ ...formData, candidateName: e.target.value })}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition"
        />
      </div>

      {/* Certificate ID */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Certificate ID (C2C-INT-YYYY-XXXXX) <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={onRefreshId}
            title="Auto-fetch next ID from database"
            className="text-[11px] text-navy-700 hover:text-navy-950 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Next ID
          </button>
        </div>
        <input
          type="text"
          required
          placeholder="e.g. C2C-INT-2026-00001"
          value={formData.certificateId || ''}
          onChange={(e) => onChange({ ...formData, certificateId: e.target.value.toUpperCase() })}
          className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition uppercase"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Atomic database counter guarantees unique sequential numbering.
        </p>
      </div>

      {/* Domain */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Internship Domain <span className="text-rose-500">*</span>
        </label>
        <select
          value={isCustomDomain ? 'Custom Domain' : formData.domain || 'Full Stack Development'}
          onChange={handleDomainSelectChange}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition bg-white"
        >
          {STANDARD_DOMAINS.map((dom) => (
            <option key={dom} value={dom}>
              {dom}
            </option>
          ))}
        </select>

        {isCustomDomain && (
          <input
            type="text"
            required
            placeholder="Enter Custom Domain (e.g. Embedded IoT Systems)"
            value={formData.domain || ''}
            onChange={(e) => onChange({ ...formData, domain: e.target.value })}
            className="w-full mt-2 px-3.5 py-2 text-sm rounded-lg border border-gold-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Internship Duration <span className="text-rose-500">*</span>
        </label>
        <select
          value={isCustomDuration ? 'Custom Duration' : formData.duration || '3 Months'}
          onChange={handleDurationSelectChange}
          className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition bg-white"
        >
          {STANDARD_DURATIONS.map((dur) => (
            <option key={dur} value={dur}>
              {dur}
            </option>
          ))}
        </select>

        {isCustomDuration && (
          <input
            type="text"
            required
            placeholder="Enter Custom Duration (e.g. 45 Days, 10 Weeks)"
            value={formData.duration || ''}
            onChange={(e) => onChange({ ...formData, duration: e.target.value })}
            className="w-full mt-2 px-3.5 py-2 text-sm rounded-lg border border-gold-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        )}
      </div>

      {/* Start Date & Completion Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.startDate || ''}
            onChange={handleStartDateChange}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Completion Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.completionDate || ''}
            onChange={(e) => onChange({ ...formData, completionDate: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        </div>
      </div>

      {/* Issue Date & Signatory Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Issue Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.issueDate || ''}
            onChange={(e) => onChange({ ...formData, issueDate: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Signatory Designation
          </label>
          <input
            type="text"
            value={formData.signatoryDesignation || ''}
            onChange={(e) => onChange({ ...formData, signatoryDesignation: e.target.value })}
            placeholder="e.g. Director & Head of Programs"
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 transition"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isIssuing}
          className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          {isIssuing ? 'Registering & Generating PDF...' : 'Issue & Register Certificate'}
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;
