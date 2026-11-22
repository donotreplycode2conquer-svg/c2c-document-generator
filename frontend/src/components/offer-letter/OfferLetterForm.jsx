import React, { useState, useEffect } from 'react';
import { calculateEndDate } from '../../utils/formatters';
import { RefreshCw, Download, Printer, RotateCcw, Sparkles } from 'lucide-react';

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

export const OfferLetterForm = ({
  formData,
  onChange,
  onGenerate,
  onPrint,
  onReset,
  onRefreshId,
  isGenerating = false,
  error = null
}) => {
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  // Synchronize custom flags with current formData
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
      const computedEndDate = calculateEndDate(formData.startDate, val);
      onChange({
        ...formData,
        duration: val,
        endDate: computedEndDate || formData.endDate
      });
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    const computedEnd = calculateEndDate(newStart, formData.duration);
    onChange({
      ...formData,
      startDate: newStart,
      endDate: computedEnd || formData.endDate
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate();
      }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-navy-900">Offer Letter Details</h2>
          <p className="text-xs text-slate-500">All fields update the live preview immediately.</p>
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

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

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

      {/* Offer Letter ID & Refresh */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Offer Letter ID <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={onRefreshId}
            title="Auto-fetch next ID"
            className="text-[11px] text-navy-700 hover:text-navy-950 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Next ID
          </button>
        </div>
        <input
          type="text"
          required
          placeholder="e.g. C2C-OFF-2026-00001"
          value={formData.offerLetterId || ''}
          onChange={(e) => onChange({ ...formData, offerLetterId: e.target.value.toUpperCase() })}
          className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition uppercase"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Automatically generated sequential ID. Administrator can edit if needed.
        </p>
      </div>

      {/* Internship Domain */}
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

      {/* Start Date & End Date */}
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
            End Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.endDate || ''}
            onChange={(e) => onChange({ ...formData, endDate: e.target.value })}
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
          disabled={isGenerating}
          className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          <Download className="w-4 h-4 text-gold-400" />
          {isGenerating ? 'Generating PDF...' : 'Generate & Download PDF'}
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

export default OfferLetterForm;
