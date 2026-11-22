import React, { useEffect, useState } from 'react';
import { formatDateDisplay } from '../../utils/formatters';
import { generateQrDataUrl, buildVerificationUrl } from '../../utils/qrGenerator';
import { Logo } from '../common/Logo';

export const CertificatePreview = ({ data, settings, innerRef }) => {
  const {
    candidateName = 'Isha Sharma',
    certificateId = 'C2C-2026-JD-94046',
    domain = 'Java Development',
    duration = '1 Month',
    startDate = '2026-10-22',
    completionDate = '2026-11-21',
    issueDate = new Date().toISOString().split('T')[0],
    qrEnabled = false,
    status = 'valid'
  } = data || {};

  const companyName = 'Code2Conquer Pvt. Ltd.';
  const verificationBaseUrl = settings?.verificationBaseUrl || import.meta.env.VITE_VERIFICATION_PORTAL_URL || 'https://c2c-verification-portal.vercel.app';

  const [qrDataUrl, setQrDataUrl] = useState('');
  const verificationUrl = buildVerificationUrl(certificateId, verificationBaseUrl);

  useEffect(() => {
    if (qrEnabled && certificateId) {
      generateQrDataUrl(verificationUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0B192C',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl);
    } else {
      setQrDataUrl('');
    }
  }, [qrEnabled, certificateId, verificationUrl]);

  const isValid = String(status).toLowerCase() !== 'revoked';

  return (
    <div
      ref={innerRef}
      id="certificate-canvas"
      className="printable-document bg-white text-slate-800 font-sans a4-shadow relative flex flex-col justify-between overflow-hidden select-none"
      style={{
        width: '1123px',
        height: '794px',
        minWidth: '1123px',
        minHeight: '794px',
        padding: '52px 64px 40px 64px',
        boxSizing: 'border-box',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* Outer Border with Inset Navy Line */}
      <div className="absolute inset-4 border border-[#0B192C] pointer-events-none" />

      {/* Modern Dual-Tone Geometric Corner Accents */}
      {/* Top Left */}
      <div className="absolute top-4 left-4 w-16 h-16 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 70 70" className="w-full h-full">
          <polygon points="0,0 42,0 0,42" fill="#0B192C" />
          <polygon points="0,52 14,52 52,14 52,0 36,0 0,36" fill="#2563EB" />
        </svg>
      </div>

      {/* Top Right */}
      <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none overflow-hidden scale-x-[-1]">
        <svg viewBox="0 0 70 70" className="w-full h-full">
          <polygon points="0,0 42,0 0,42" fill="#0B192C" />
          <polygon points="0,52 14,52 52,14 52,0 36,0 0,36" fill="#2563EB" />
        </svg>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-4 left-4 w-16 h-16 pointer-events-none overflow-hidden scale-y-[-1]">
        <svg viewBox="0 0 70 70" className="w-full h-full">
          <polygon points="0,0 42,0 0,42" fill="#0B192C" />
          <polygon points="0,52 14,52 52,14 52,0 36,0 0,36" fill="#2563EB" />
        </svg>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-4 right-4 w-16 h-16 pointer-events-none overflow-hidden rotate-180">
        <svg viewBox="0 0 70 70" className="w-full h-full">
          <polygon points="0,0 42,0 0,42" fill="#0B192C" />
          <polygon points="0,52 14,52 52,14 52,0 36,0 0,36" fill="#2563EB" />
        </svg>
      </div>

      {/* Top Section: Official Code2Conquer Header */}
      <div className="relative z-10 flex flex-col items-center pt-1">
        {/* Brand Logo & Tagline */}
        <div className="mb-2">
          <Logo size="md" customLogo={settings?.companyLogoBase64} />
        </div>

        {/* Official Credential of Achievement */}
        <div className="text-[11px] font-bold tracking-[0.24em] text-[#2563EB] uppercase mb-1">
          OFFICIAL CREDENTIAL OF ACHIEVEMENT
        </div>

        {/* Main Title */}
        <h1 className="text-[26px] font-black tracking-[0.06em] text-[#0B192C] uppercase leading-tight font-sans">
          INTERNSHIP COMPLETION CERTIFICATE
        </h1>

        {/* Center Divider Bar with Blue Pill Accent */}
        <div className="flex items-center justify-center gap-2 my-2 w-full max-w-md">
          <div className="h-[1.5px] flex-1 bg-slate-300" />
          <div className="w-3.5 h-1.5 rounded-full bg-[#2563EB]" />
          <div className="h-[1.5px] flex-1 bg-slate-300" />
        </div>
      </div>

      {/* Central Recipient & Achievement Content */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto px-10">
        <p className="text-xs text-slate-500 font-medium mb-1">
          This is to certify that
        </p>

        {/* Candidate Full Name */}
        <div className="mb-2">
          <span className="text-[32px] font-bold text-[#1E3A8A] tracking-tight block">
            {candidateName || 'Candidate Name'}
          </span>
          <div className="h-[1px] bg-slate-300 w-80 mx-auto mt-1.5" />
        </div>

        {/* Achievement Statement matching exact company wording */}
        <p className="text-[13px] text-slate-600 max-w-3xl leading-relaxed text-center font-normal mt-2">
          has successfully completed the <strong className="text-slate-800 font-semibold">{duration || '1 Month'}</strong> professional internship programme in <strong className="text-slate-800 font-semibold">{domain || 'Java Development'}</strong> at <strong className="text-slate-900 font-bold">Code2Conquer</strong>, demonstrating technical competence, commitment to practical milestones, and exemplary performance on industry-aligned problem statements.
        </p>
      </div>

      {/* Bottom Section: 3-Column Layout matching official PDF */}
      <div className="relative z-10 grid grid-cols-12 items-end px-6 pb-2">
        {/* Left Column: Certificate ID, Date, Status */}
        <div className="col-span-4 text-left space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              CERTIFICATE ID:
            </span>
            <span className="text-xs sm:text-[13px] font-bold font-mono text-[#2563EB] tracking-wide block">
              {certificateId || 'C2C-2026-JD-94046'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              ISSUE DATE:
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {formatDateDisplay(issueDate) || '22 November 2026'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              CREDENTIAL STATUS:
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider block ${
                isValid ? 'text-[#16A34A]' : 'text-rose-600'
              }`}
            >
              {isValid ? 'VALID' : 'REVOKED'}
            </span>
          </div>
        </div>

        {/* Center Column: Seal / QR Code */}
        <div className="col-span-4 flex flex-col items-center justify-center text-center">
          {qrEnabled ? (
            /* QR Code Option */
            <div className="flex flex-col items-center">
              <div className="p-1 bg-white border border-slate-300 shadow-sm rounded-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to Verify"
                    className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-22 sm:h-22 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>
              <span className="text-[9.5px] font-black uppercase text-slate-800 tracking-wider mt-1.5 block">
                SCAN TO VERIFY
              </span>
              <span className="text-[8px] text-slate-500 font-mono break-all max-w-[190px] text-center leading-tight">
                {verificationUrl}
              </span>
            </div>
          ) : (
            /* Non-QR Option: Official Double-Ring Stamp Seal */
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#2563EB] p-[2px] flex items-center justify-center bg-white shadow-sm">
                <div className="w-full h-full rounded-full border border-[#2563EB] flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[7.5px] font-extrabold uppercase text-[#0B192C] tracking-wider leading-none">
                    CODE2CONQUER
                  </span>
                  <span className="text-[6.5px] font-bold text-[#2563EB] leading-tight my-0.5">
                    ★ OFFICIAL SEAL ★
                  </span>
                  <span className="text-[6px] font-bold uppercase text-slate-600 leading-tight">
                    AUTHENTIC CREDENTIAL
                  </span>
                  <span className="text-[6.5px] font-extrabold uppercase text-[#2563EB] leading-none mt-0.5">
                    OPERATIONS
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider mt-1.5 block">
                OFFICIALLY VERIFIED CREDENTIAL
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">
                Verify online at: {settings?.verificationBaseUrl ? settings.verificationBaseUrl.replace(/^https?:\/\//, '') : 'code2conquer.com'}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Digitally Signed matching media_1795342840727_dc45ac5c.png exactly */}
        <div className="col-span-4 flex flex-col items-end text-right">
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#0B192C', margin: '0 0 4px 0' }}>
            For and on behalf of Code2Conquer
          </p>

          {/* Official High-Contrast Digitally Signed Box with Explicit Sizing and Colors */}
          <div
            style={{
              width: '230px',
              backgroundColor: '#F0F7FF',
              border: '1.5px solid #1D4ED8',
              borderRadius: '8px',
              padding: '6px 10px',
              boxSizing: 'border-box',
              textAlign: 'left',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 900,
                  color: '#2563EB',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                DIGITALLY SIGNED
              </span>
            </div>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#0B192C',
                marginTop: '2px',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              Authenticated Electronic Document
            </div>
            <div
              style={{
                fontSize: '8.5px',
                fontWeight: 500,
                color: '#475569',
                marginTop: '1px',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              No physical signature required
            </div>
          </div>

          {/* Signature Underline */}
          <div style={{ width: '230px', height: '2px', backgroundColor: '#0B192C', marginBottom: '4px' }} />

          {/* Signatory Text */}
          <div style={{ textAlign: 'right', width: '230px' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#0B192C', lineHeight: '1.2', margin: 0 }}>
              Authorised Signatory
            </p>
            <p style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B', lineHeight: '1.2', margin: '2px 0 0 0' }}>
              Operations &amp; Certification Committee
            </p>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#0B192C', lineHeight: '1.2', margin: '2px 0 0 0' }}>
              {companyName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
