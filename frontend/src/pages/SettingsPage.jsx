import React, { useState, useEffect } from 'react';
import { offerLetterService } from '../services/offerLetterService';
import { storage } from '../utils/storage';
import { OFFICIAL_VERIFICATION_PORTAL_URL, getVerificationBaseUrl } from '../utils/qrGenerator';
import {
  Settings,
  Database,
  Building,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Globe,
  FileSignature
} from 'lucide-react';

export const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    companyName: 'Code2Conquer',
    companyEmail: 'donotreply.code2conquer@gmail.com',
    companyPhone: '',
    companyAddress: '',
    companyWebsite: '',
    authorizedSignatoryDesignation: 'Authorised Signatory',
    verificationBaseUrl: getVerificationBaseUrl(),
    defaultCertificateDesign: 'navy-blue',
    defaultOfferLetterDesign: 'corporate-classic',
    companyLogoBase64: '',
    signatureImageBase64: ''
  });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await offerLetterService.getSettings();
        if (res.success && res.settings) {
          const sanitizedUrl = getVerificationBaseUrl(res.settings.verificationBaseUrl);
          setFormData((prev) => ({
            ...prev,
            ...res.settings,
            verificationBaseUrl: sanitizedUrl
          }));
        }
      } catch (err) {
        console.warn('Could not load settings from server, using local defaults:', err.message);
        const cached = storage.getSettings();
        if (cached) setFormData((prev) => ({ ...prev, ...cached, verificationBaseUrl: getVerificationBaseUrl(cached.verificationBaseUrl) }));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Logo image file size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, companyLogoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Signature image file size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, signatureImageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    setTestResult(null);
    try {
      const res = await offerLetterService.testDbConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Database test error: ' + (err.message || 'Cannot reach backend')
      });
    } finally {
      setTestingDb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await offerLetterService.updateSettings(formData);
      if (res.success) {
        storage.setSettings(formData);
        setSuccessMessage('Settings updated and saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      // If DB is offline, save in local storage anyway
      storage.setSettings(formData);
      setSuccessMessage('Settings saved locally on this machine (Central DB offline).');
      setTimeout(() => setSuccessMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          Configuration
        </span>
        <h1 className="text-2xl font-bold text-navy-950">Settings & Central API</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure company identity, verification website parameters, and cloud database connectivity.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-gold-600" />
            <h2 className="text-sm font-bold text-navy-900">Company Information & Branding</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Official Email</label>
              <input
                type="email"
                required
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="text"
                value={formData.companyWebsite}
                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          {/* Logo & Signature Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Custom Company Logo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {formData.companyLogoBase64 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, companyLogoBase64: '' })}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                If omitted, the standard Code2Conquer C2C emblem is rendered.
              </p>
            </div>

            {/* Signature */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Signature Asset (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition">
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Upload Signature</span>
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
                {formData.signatureImageBase64 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, signatureImageBase64: '' })}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove Signature
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Corporate signature image to display above designation block.
              </p>
            </div>
          </div>
        </div>

        {/* Document & Signatory Settings Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <h2 className="text-sm font-bold text-navy-900">Signatory & Verification Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Signatory Designation
              </label>
              <input
                type="text"
                required
                value={formData.authorizedSignatoryDesignation}
                onChange={(e) => setFormData({ ...formData, authorizedSignatoryDesignation: e.target.value })}
                placeholder="e.g. Director & Head of Programs"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Verification Portal URL
              </label>
              <input
                type="text"
                required
                value={formData.verificationBaseUrl}
                onChange={(e) => setFormData({ ...formData, verificationBaseUrl: e.target.value })}
                placeholder="https://c2c-verification-portal.vercel.app"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Embedded in QR codes as: {getVerificationBaseUrl(formData.verificationBaseUrl)}/verify/C2C-2026-WD-35034
              </p>
            </div>
          </div>
        </div>

        {/* Database & Central API Connection Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gold-600" />
              <h2 className="text-sm font-bold text-navy-900">Central API & MongoDB Atlas Setup</h2>
            </div>
            <button
              type="button"
              onClick={handleTestDatabase}
              disabled={testingDb}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-navy-900 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin' : ''}`} />
              <span>{testingDb ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold mb-1">Backend API Base URL</span>
              <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-navy-900">
                {apiBaseUrl}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Configured via <code>VITE_API_BASE_URL</code> in <code>frontend/.env</code>.
              </p>
            </div>

            <div>
              <span className="text-slate-500 block font-semibold mb-1">Public Verification Endpoint</span>
              <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-navy-900 truncate">
                {apiBaseUrl}/api/certificates/verify/:id
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                To be consumed by the separate verification website.
              </p>
            </div>
          </div>

          {/* Database Test Result Box */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                {testResult.message}
              </p>
              {testResult.dbStatus && (
                <div className="mt-2 font-mono text-[11px] space-y-0.5">
                  <p>Status: {testResult.dbStatus.state}</p>
                  <p>Target URI: {testResult.dbStatus.uriMasked}</p>
                </div>
              )}
            </div>
          )}

          {/* Configuration Instructions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-navy-900">How to connect your MongoDB Atlas Cluster:</p>
            <ol className="list-decimal pl-5 space-y-1 text-[11px]">
              <li>Open <code>backend/.env</code> in your code editor.</li>
              <li>Set <code>MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster&gt;.mongodb.net/code2conquer?retryWrites=true&amp;w=majority</code></li>
              <li>Ensure your current IP address is whitelisted in MongoDB Atlas Network Access.</li>
              <li>Save the file and click "Test Connection" above.</li>
            </ol>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
