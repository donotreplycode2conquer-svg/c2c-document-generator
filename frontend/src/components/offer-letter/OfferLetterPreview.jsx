import React from 'react';
import { formatDateDisplay } from '../../utils/formatters';
import { Logo } from '../common/Logo';

export const OfferLetterPreview = ({ data, settings, innerRef }) => {
  const {
    candidateName = 'Jane Doe',
    offerLetterId = 'C2C-OFF-2026-00001',
    domain = 'Full Stack Development',
    duration = '3 Months',
    startDate = '2026-07-01',
    endDate = '2026-09-30',
    issueDate = new Date().toISOString().split('T')[0]
  } = data || {};

  const companyName = 'Code2Conquer Pvt. Ltd.';
  const companyEmail = 'donotreply.code2conquer@gmail.com';

  return (
    <div
      ref={innerRef}
      id="offer-letter-canvas"
      className="printable-document bg-white text-slate-800 font-sans a4-shadow relative flex flex-col justify-between overflow-hidden"
      style={{
        width: '794px',
        height: '1123px',
        minWidth: '794px',
        maxWidth: '794px',
        minHeight: '1123px',
        maxHeight: '1123px',
        padding: '36px 48px 28px 48px',
        boxSizing: 'border-box',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* Top Accent Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B192C] via-[#2563EB] to-[#0B192C]" />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Letterhead */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center">
            <Logo size="md" customLogo={settings?.companyLogoBase64} />
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <p className="font-extrabold text-base text-[#0B192C] tracking-normal leading-tight">
              {companyName}
            </p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Operations &amp; Certification Committee
            </p>
            <p className="text-xs font-bold text-[#1D4ED8] font-mono leading-tight">
              Email: {companyEmail}
            </p>
          </div>
        </div>

        {/* Reference & Date Bar */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mt-3.5 mb-3.5">
          <div>
            <span className="text-slate-500 font-medium">Offer Letter ID:&nbsp;</span>
            <span className="font-mono font-bold text-[#0B192C]">{offerLetterId || 'C2C-OFF-2026-XXXXX'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Date:&nbsp;</span>
            <span className="font-semibold text-slate-800">{formatDateDisplay(issueDate)}</span>
          </div>
        </div>

        {/* Recipient Block */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] mb-0.5">
            Official Offer of Internship Engagement
          </p>
          <p className="text-lg font-bold text-[#0B192C] leading-snug">
            {candidateName || '[Candidate Full Name]'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Internship Candidate</p>
        </div>

        {/* Confirmation Paragraphs */}
        <div className="space-y-2.5 text-[11.5px] text-slate-700 leading-relaxed text-left">
          <p>
            Dear <strong className="text-[#0B192C]">{candidateName || 'Candidate'}</strong>,
          </p>

          <p>
            We are pleased to extend an offer of internship engagement to you at <strong className="text-[#0B192C]">Code2Conquer</strong> for the position of <strong>Intern in {domain || 'Software Development'}</strong>. Based on your profile and foundational technical competencies, we believe you will make meaningful contributions while gaining valuable practical industry exposure.
          </p>

          {/* Key Internship Details Box */}
          <div className="my-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Domain Specialization</span>
                <span className="font-bold text-[#0B192C]">{domain || 'Web Development'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Internship Duration</span>
                <span className="font-bold text-[#0B192C]">{duration || '3 Months'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Commencement Date</span>
                <span className="font-bold text-slate-800">{formatDateDisplay(startDate) || 'Pending'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Conclusion Date</span>
                <span className="font-bold text-slate-800">{formatDateDisplay(endDate) || 'Pending'}</span>
              </div>
            </div>
          </div>

          <p>
            During your internship, you will be assigned to practical problem statements, milestone-based engineering deliverables, and technical modules guided by experienced mentors. This engagement is oriented towards developing practical competence in contemporary development workflows.
          </p>

          <div>
            <p className="font-bold text-[#0B192C] mb-0.5">Terms of Engagement:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-600 text-[10.5px]">
              <li>
                <strong>Professional Standards:</strong> You are expected to demonstrate commitment, professional communication, and adherence to project deadlines.
              </li>
              <li>
                <strong>Confidentiality:</strong> All technical materials, internal workflows, and project documentation shared during your engagement remain confidential to Code2Conquer.
              </li>
              <li>
                <strong>Intellectual Property:</strong> Any code, assets, or documentation produced as part of the internship deliverables shall remain the property of Code2Conquer.
              </li>
              <li>
                <strong>Certification:</strong> Upon successful completion of your internship tenure and milestone reviews, an official, verifiable Certificate of Internship Completion will be issued.
              </li>
            </ul>
          </div>

          <p>
            We look forward to having you on board and wish you a highly enriching learning experience at Code2Conquer.
          </p>
        </div>

        {/* Signatory Section matching media_1795342840727_dc45ac5c.png exactly */}
        <div className="mt-4 pt-2 flex items-end justify-between">
          <div>
            <p style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500, margin: '0 0 2px 0' }}>
              Sincerely,
            </p>
            <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#0B192C', margin: '0 0 6px 0' }}>
              {companyName}
            </p>

            {/* Official High-Contrast Digitally Signed Box with Explicit Sizing and Colors */}
            <div
              style={{
                width: '240px',
                backgroundColor: '#F0F7FF',
                border: '1.5px solid #1D4ED8',
                borderRadius: '8px',
                padding: '8px 12px',
                boxSizing: 'border-box',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  width="16"
                  height="16"
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
                    fontSize: '11px',
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
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#0B192C',
                  marginTop: '3px',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                Authenticated Electronic Document
              </div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: '#475569',
                  marginTop: '2px',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
              >
                No physical signature required
              </div>
            </div>

            {/* Signature Underline */}
            <div style={{ width: '240px', height: '2px', backgroundColor: '#0B192C', marginTop: '8px', marginBottom: '6px' }} />

            {/* Signatory Designation */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#0B192C', lineHeight: '1.2', margin: 0 }}>
                Authorised Signatory
              </p>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', lineHeight: '1.2', margin: '2px 0 0 0' }}>
                Operations &amp; Certification Committee
              </p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#0B192C', lineHeight: '1.2', margin: '2px 0 0 0' }}>
                {companyName}
              </p>
            </div>
          </div>

          {/* Official Verification Seal on Right */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#2563EB] p-1 flex items-center justify-center bg-white shadow-sm">
              <div className="w-full h-full rounded-full border border-dashed border-[#2563EB] flex flex-col items-center justify-center text-[7px] font-extrabold text-[#0B192C] text-center leading-tight">
                CODE2CONQUER<br/>
                <span className="text-[#2563EB] text-[6px]">OFFICIAL</span><br/>
                ISSUED
              </div>
            </div>
            <span className="text-[8.5px] tracking-wider uppercase font-bold text-slate-500 mt-1">
              Official Document
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 mt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between">
        <span>Code2Conquer • Contact: {companyEmail}</span>
        <span>Internal Document • ID: {offerLetterId}</span>
      </div>
    </div>
  );
};

export default OfferLetterPreview;
