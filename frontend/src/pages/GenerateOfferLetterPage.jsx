import React, { useState, useEffect, useRef } from 'react';
import { OfferLetterForm } from '../components/offer-letter/OfferLetterForm';
import { OfferLetterPreview } from '../components/offer-letter/OfferLetterPreview';
import { ZoomControls } from '../components/common/ZoomControls';
import { offerLetterService } from '../services/offerLetterService';
import { exportElementToPdf, triggerPrint, generatePdfFilename } from '../services/pdfGeneratorService';
import { getTodayInputString, calculateEndDate } from '../utils/formatters';
import { storage } from '../utils/storage';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const GenerateOfferLetterPage = () => {
  const previewRef = useRef(null);
  const [zoom, setZoom] = useState(0.85);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [settings, setSettings] = useState(null);

  // Form State
  const defaultStartDate = getTodayInputString();
  const defaultDuration = '3 Months';
  const defaultEndDate = calculateEndDate(defaultStartDate, defaultDuration);

  const [formData, setFormData] = useState(() => {
    const savedDraft = storage.getDraftOffer();
    if (savedDraft) return savedDraft;

    return {
      candidateName: '',
      offerLetterId: 'C2C-OFF-2026-00001',
      domain: 'Full Stack Development',
      duration: defaultDuration,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      issueDate: defaultStartDate,
      signatoryDesignation: 'Authorised Signatory'
    };
  });

  // Fetch settings & next ID on mount
  useEffect(() => {
    const loadInitData = async () => {
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
        const idRes = await offerLetterService.getNextIdPreview();
        if (idRes.success && idRes.nextOfferId) {
          setFormData((prev) => ({
            ...prev,
            offerLetterId: prev.offerLetterId === 'C2C-OFF-2026-00001' ? idRes.nextOfferId : prev.offerLetterId
          }));
        }
      } catch (e) {
        console.warn('Could not fetch next offer ID:', e);
      }
    };

    loadInitData();
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    storage.setDraftOffer(formData);
  }, [formData]);

  const handleRefreshId = async () => {
    try {
      const idRes = await offerLetterService.getNextIdPreview();
      if (idRes.success && idRes.nextOfferId) {
        setFormData((prev) => ({ ...prev, offerLetterId: idRes.nextOfferId }));
        setSuccessMessage(`Assigned next sequential ID: ${idRes.nextOfferId}`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      setErrorMessage('Could not fetch next ID: ' + err.message);
    }
  };

  const handleReset = () => {
    storage.clearDraftOffer();
    setFormData({
      candidateName: '',
      offerLetterId: 'C2C-OFF-2026-00001',
      domain: 'Full Stack Development',
      duration: '3 Months',
      startDate: defaultStartDate,
      endDate: calculateEndDate(defaultStartDate, '3 Months'),
      issueDate: defaultStartDate,
      signatoryDesignation: settings?.authorizedSignatoryDesignation || 'Authorised Signatory'
    });
    setErrorMessage(null);
    setSuccessMessage('Form reset successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleGenerateAndDownload = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.candidateName.trim()) {
      setErrorMessage('Please enter the candidate full name.');
      return;
    }
    if (!formData.offerLetterId.trim()) {
      setErrorMessage('Offer Letter ID is required.');
      return;
    }
    if (!formData.domain.trim()) {
      setErrorMessage('Internship domain is required.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setErrorMessage('Start date and end date are required.');
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Record offer letter in backend history
      try {
        await offerLetterService.recordOfferLetter({
          candidateName: formData.candidateName,
          domain: formData.domain,
          duration: formData.duration,
          startDate: formData.startDate,
          endDate: formData.endDate,
          issueDate: formData.issueDate,
          signatoryDesignation: formData.signatoryDesignation,
          customOfferId: formData.offerLetterId
        });
      } catch (backendErr) {
        console.warn('Backend history record failed (running in offline fallback mode):', backendErr.message);
        // Save to offline local storage history
        storage.addOfflineHistory({
          documentId: formData.offerLetterId,
          documentType: 'OFFER_LETTER',
          candidateName: formData.candidateName,
          domain: formData.domain,
          duration: formData.duration,
          issueDate: formData.issueDate,
          status: 'VALID',
          createdAt: new Date().toISOString()
        });
      }

      // 2. Export DOM element to high-res A4 PDF and download locally
      const filename = generatePdfFilename('OFFER_LETTER', formData.candidateName, formData.offerLetterId);
      await exportElementToPdf(previewRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2.5
      });

      setSuccessMessage(`Offer letter generated and downloaded successfully: ${filename}`);
      
      // Auto increment next ID for convenience
      handleRefreshId();
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMessage('Failed to generate PDF document: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (previewRef.current) {
      triggerPrint(previewRef.current, { orientation: 'portrait' });
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
            Internship Offer Letter Generator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create corporate A4 offer letters with formal clauses, terms, and branding.
          </p>
        </div>

        {/* Zoom Controls for Preview */}
        <ZoomControls zoom={zoom} setZoom={setZoom} />
      </div>

      {/* Notifications */}
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

      {/* Two Column Workspace: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-4">
          <OfferLetterForm
            formData={formData}
            onChange={setFormData}
            onGenerate={handleGenerateAndDownload}
            onPrint={handlePrint}
            onReset={handleReset}
            onRefreshId={handleRefreshId}
            isGenerating={isGenerating}
            error={errorMessage}
          />
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 bg-slate-200/60 rounded-2xl p-4 sm:p-6 border border-slate-300/80 flex flex-col items-center overflow-x-auto min-h-[600px]">
          <div className="w-full flex items-center justify-between text-xs text-slate-600 mb-3 px-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-navy-900">
              Live A4 Portrait Preview
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
            <OfferLetterPreview
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

export default GenerateOfferLetterPage;
