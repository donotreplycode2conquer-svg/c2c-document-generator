import React, { useState, useEffect, useRef } from 'react';
import { CertificateForm } from '../components/certificate/CertificateForm';
import { CertificatePreview } from '../components/certificate/CertificatePreview';
import { ZoomControls } from '../components/common/ZoomControls';
import { certificateService } from '../services/certificateService';
import { offerLetterService } from '../services/offerLetterService';
import { exportElementToPdf, triggerPrint, generatePdfFilename } from '../services/pdfGeneratorService';
import { getTodayInputString, calculateEndDate } from '../utils/formatters';
import { storage } from '../utils/storage';
import { buildVerificationUrl } from '../utils/qrGenerator';
import { CheckCircle2, AlertCircle, ShieldAlert, ExternalLink } from 'lucide-react';

export const GenerateCertificatePage = () => {
  const previewRef = useRef(null);
  const [zoom, setZoom] = useState(0.70); // Landscape A4 default zoom
  const [isIssuing, setIsIssuing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [settings, setSettings] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(() => 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

  const defaultStartDate = getTodayInputString();
  const defaultDuration = '1 Month';
  const defaultCompletionDate = calculateEndDate(defaultStartDate, defaultDuration);

  const [formData, setFormData] = useState(() => {
    const savedDraft = storage.getDraftCert();
    if (savedDraft) return savedDraft;

    return {
      candidateName: 'Isha Sharma',
      certificateId: 'C2C-2026-JD-94046',
      domain: 'Java Development',
      duration: defaultDuration,
      startDate: defaultStartDate,
      completionDate: defaultCompletionDate,
      issueDate: defaultStartDate,
      qrEnabled: false,
      signatoryDesignation: 'Authorised Signatory'
    };
  });

  // Check DB health and load settings & next ID
  const checkHealthAndInit = async () => {
    try {
      const healthRes = await offerLetterService.getHealth();
      const isOnline = healthRes?.database === 'connected' || healthRes?.database?.connected || false;
      setDbConnected(isOnline);
    } catch {
      setDbConnected(false);
    }

    try {
      const settingsRes = await offerLetterService.getSettings();
      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
        if (settingsRes.settings.authorizedSignatoryDesignation && !formData.signatoryDesignation) {
          setFormData((prev) => ({
            ...prev,
            signatoryDesignation: settingsRes.settings.authorizedSignatoryDesignation
          }));
        }
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }

    try {
      const idRes = await certificateService.getNextIdPreview();
      if (idRes.success && idRes.nextCertificateId) {
        setFormData((prev) => ({
          ...prev,
          certificateId: prev.certificateId === 'C2C-INT-2026-00001' ? idRes.nextCertificateId : prev.certificateId
        }));
      }
    } catch (e) {
      console.warn('Could not fetch next certificate ID:', e);
    }
  };

  useEffect(() => {
    checkHealthAndInit();
  }, []);

  // Save draft locally
  useEffect(() => {
    storage.setDraftCert(formData);
  }, [formData]);

  const handleRefreshId = async () => {
    try {
      const idRes = await certificateService.getNextIdPreview();
      if (idRes.success && idRes.nextCertificateId) {
        setFormData((prev) => ({ ...prev, certificateId: idRes.nextCertificateId }));
        // Also refresh idempotency token for new certificate attempt
        setClientRequestId('req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
        setSuccessData({ message: `Fetched next available ID: ${idRes.nextCertificateId}` });
        setTimeout(() => setSuccessData(null), 3000);
      }
    } catch (err) {
      setErrorMessage('Could not fetch next ID from database: ' + err.message);
    }
  };

  const handleReset = () => {
    storage.clearDraftCert();
    setFormData({
      candidateName: 'Isha Sharma',
      certificateId: 'C2C-2026-JD-94046',
      domain: 'Java Development',
      duration: '1 Month',
      startDate: defaultStartDate,
      completionDate: calculateEndDate(defaultStartDate, '1 Month'),
      issueDate: defaultStartDate,
      qrEnabled: false,
      signatoryDesignation: settings?.authorizedSignatoryDesignation || 'Authorised Signatory'
    });
    setClientRequestId('req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    setErrorMessage(null);
    setSuccessData(null);
  };

  const handleIssueCertificate = async () => {
    setErrorMessage(null);
    setSuccessData(null);

    // 1. Validation
    if (!formData.candidateName.trim()) {
      setErrorMessage('Please enter the candidate full name.');
      return;
    }
    if (!formData.certificateId.trim()) {
      setErrorMessage('Certificate ID is required.');
      return;
    }
    if (!formData.domain.trim()) {
      setErrorMessage('Internship domain is required.');
      return;
    }
    if (!formData.startDate || !formData.completionDate) {
      setErrorMessage('Start date and completion date are required.');
      return;
    }

    setIsIssuing(true);

    try {
      // 2. Submit to central MongoDB Atlas database via authenticated backend endpoint
      // Includes clientRequestId as idempotency key
      const response = await certificateService.registerCertificate({
        holderName: formData.candidateName,
        domain: formData.domain,
        duration: formData.duration,
        startDate: formData.startDate,
        completionDate: formData.completionDate,
        issueDate: formData.issueDate,
        qrEnabled: formData.qrEnabled,
        signatoryDesignation: formData.signatoryDesignation,
        customCertificateId: formData.certificateId,
        clientRequestId
      });

      if (!response.success || !response.certificate) {
        throw new Error(response.message || 'Registration rejected by central database.');
      }

      const issuedCert = response.certificate;

      // Update formData with finalized registered certificate ID
      setFormData((prev) => ({
        ...prev,
        certificateId: issuedCert.certificateId
      }));

      // 3. Generate the final high-resolution A4 landscape PDF and download locally
      const filename = generatePdfFilename('CERTIFICATE', issuedCert.holderName, issuedCert.certificateId);
      
      // Wait for preview DOM and scannable QR code image to update with finalized certificate ID
      if (formData.qrEnabled) {
        const expectedUrl = buildVerificationUrl(issuedCert.certificateId);
        let retries = 0;
        while (retries < 30) {
          const qrImg = previewRef.current?.querySelector('img[data-qr-url]');
          if (
            qrImg &&
            qrImg.getAttribute('data-qr-url') === expectedUrl &&
            qrImg.getAttribute('data-qr-loaded') === 'true' &&
            qrImg.src &&
            qrImg.src.startsWith('data:image')
          ) {
            break;
          }
          await new Promise((r) => setTimeout(r, 50));
          retries++;
        }
      } else {
        await new Promise((r) => setTimeout(r, 100));
      }

      await exportElementToPdf(previewRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2.5
      });

      // 4. Show success confirmation
      setSuccessData({
        certificate: issuedCert,
        filename,
        message: `Certificate ${issuedCert.certificateId} has been successfully registered in MongoDB Atlas and downloaded.`
      });

      // Clear draft and generate new idempotency token for subsequent certificate
      storage.clearDraftCert();
      setClientRequestId('req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
      
      // Peek next sequential ID for the next issue
      handleRefreshId();
    } catch (err) {
      console.error('Certificate registration failed:', err);
      // "If registration fails: Do not mark the certificate as issued. Do not generate a final issued PDF. Show a clear error. Allow retry. Prevent accidental duplicate records."
      setErrorMessage(
        err.message || 'Certificate registration failed. Ensure MongoDB Atlas is connected and retry.'
      );
    } finally {
      setIsIssuing(false);
    }
  };

  const handlePrint = () => {
    if (previewRef.current) {
      triggerPrint(previewRef.current, { orientation: 'landscape' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
            Document Generation
          </span>
          <h1 className="text-2xl font-bold text-navy-950">
            Internship Certificate Generator & Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue premium landscape completion certificates synchronized with MongoDB Atlas for online verification.
          </p>
        </div>

        {/* Zoom Controls */}
        <ZoomControls zoom={zoom} setZoom={setZoom} min={0.4} max={1.4} />
      </div>

      {/* Success Notification Banner */}
      {successData && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Certificate Issued & Registered Successfully!</p>
              <p className="mt-0.5 text-emerald-800">{successData.message}</p>
              {successData.certificate && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    {successData.certificate.certificateId}
                  </span>
                  <span className="text-emerald-700">
                    Status: <strong>VALID</strong>
                  </span>
                  <a
                    href={buildVerificationUrl(successData.certificate.certificateId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-100 text-xs transition"
                  >
                    <span>Open Verification Portal</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Issuance Stopped</p>
            <p className="mt-0.5">{errorMessage}</p>
            <p className="text-[11px] text-rose-600 mt-1">
              Per strict security protocol, no official certificate PDF is finalized until central database registration succeeds.
            </p>
          </div>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <CertificateForm
            formData={formData}
            onChange={setFormData}
            onIssue={handleIssueCertificate}
            onPrint={handlePrint}
            onReset={handleReset}
            onRefreshId={handleRefreshId}
            isIssuing={isIssuing}
            dbConnected={dbConnected}
            error={errorMessage}
          />
        </div>

        {/* Live Preview Column (Landscape A4) */}
        <div className="lg:col-span-7 bg-slate-200/60 rounded-2xl p-4 sm:p-6 border border-slate-300/80 flex flex-col items-center overflow-x-auto min-h-[550px]">
          <div className="w-full flex items-center justify-between text-xs text-slate-600 mb-3 px-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-navy-900">
              Live A4 Landscape Preview (297mm × 210mm)
            </span>
            <span className="text-slate-400">Scale: {Math.round(zoom * 100)}%</span>
          </div>

          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="my-2"
          >
            <CertificatePreview
              innerRef={previewRef}
              data={formData}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCertificatePage;
