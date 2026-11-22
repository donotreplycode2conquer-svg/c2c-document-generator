import React from 'react';
import { CheckCircle2, XCircle, QrCode, FileText, Award } from 'lucide-react';

export const StatusBadge = ({ type, value }) => {
  if (type === 'status') {
    const isRevoked = String(value).toLowerCase() === 'revoked';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isRevoked
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
      >
        {isRevoked ? (
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        )}
        {isRevoked ? 'REVOKED' : 'VALID'}
      </span>
    );
  }

  if (type === 'qr') {
    const hasQr = Boolean(value);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          hasQr
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}
      >
        <QrCode className={`w-3.5 h-3.5 ${hasQr ? 'text-blue-600' : 'text-slate-500'}`} />
        {hasQr ? 'QR Enabled' : 'Non-QR'}
      </span>
    );
  }

  if (type === 'docType') {
    const isOffer = value === 'OFFER_LETTER';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isOffer
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}
      >
        {isOffer ? (
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Award className="w-3.5 h-3.5 text-amber-600" />
        )}
        {isOffer ? 'Offer Letter' : 'Certificate'}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
      {value}
    </span>
  );
};

export default StatusBadge;
