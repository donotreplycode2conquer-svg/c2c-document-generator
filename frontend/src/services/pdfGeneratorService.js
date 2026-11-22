import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Standard A4 Pixel Dimensions at 96 DPI:
 * A4 Portrait: 210mm x 297mm -> 794px x 1123px
 * A4 Landscape: 297mm x 210mm -> 1123px x 794px
 */
const A4_DIMENSIONS = {
  portrait: {
    widthPx: 794,
    heightPx: 1123,
    widthMm: 210,
    heightMm: 297
  },
  landscape: {
    widthPx: 1123,
    heightPx: 794,
    widthMm: 297,
    heightMm: 210
  }
};

/**
 * Creates an unscaled, clean clone of the document element inside the active viewport
 * but behind the document root (zIndex: -99999) so text glyphs and SVGs are never
 * culled by Chromium's offscreen optimization.
 */
const createCleanOffscreenClone = (element, orientation = 'portrait') => {
  const dim = A4_DIMENSIONS[orientation] || A4_DIMENSIONS.portrait;

  // Clone node deeply
  const clone = element.cloneNode(true);

  // Wrapper positioned within the active viewport bounds (top: 0, left: 0)
  // Behind everything (zIndex: -99999) so it is invisible to the user but fully laid out by browser
  const wrapper = document.createElement('div');
  wrapper.id = 'c2c-pdf-render-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.zIndex = '-99999';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.width = `${dim.widthPx}px`;
  wrapper.style.height = `${dim.heightPx}px`;
  wrapper.style.overflow = 'hidden';
  wrapper.style.transform = 'none';
  wrapper.style.background = '#FFFFFF';

  // Force clean styles on clone root
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.width = `${dim.widthPx}px`;
  clone.style.minWidth = `${dim.widthPx}px`;
  clone.style.maxWidth = `${dim.widthPx}px`;
  clone.style.height = `${dim.heightPx}px`;
  clone.style.minHeight = `${dim.heightPx}px`;
  clone.style.maxHeight = `${dim.heightPx}px`;
  clone.style.boxSizing = 'border-box';
  clone.style.letterSpacing = 'normal';
  clone.style.wordSpacing = 'normal';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Sanitize all descendants in clone after being mounted into the DOM
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el.style) {
      if (el.style.textAlign === 'justify') {
        el.style.textAlign = 'left';
      }
      if (el.style.transform && el.style.transform.includes('scale')) {
        el.style.transform = 'none';
      }
    }
  });

  return { wrapper, clone, dim };
};

/**
 * Renders an element into a clean, un-distorted canvas
 */
const renderElementToCanvas = async (element, orientation = 'portrait') => {
  // Ensure all web fonts are loaded
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Fonts ready check ignored:', e);
    }
  }

  const { wrapper, clone, dim } = createCleanOffscreenClone(element, orientation);

  try {
    // Wait for DOM layout pass and SVG paint
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(clone, {
      scale: 2.2, // Crisp high-definition scale (equivalent to ~210-300 DPI)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      width: dim.widthPx,
      height: dim.heightPx,
      windowWidth: dim.widthPx,
      windowHeight: dim.heightPx,
      onclone: (clonedDoc) => {
        // Double-check no text-justify remains
        const justEls = clonedDoc.querySelectorAll('*');
        justEls.forEach((el) => {
          if (el.style && el.style.textAlign === 'justify') {
            el.style.textAlign = 'left';
          }
        });
      }
    });

    return { canvas, dim };
  } finally {
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

/**
 * Builds jsPDF instance from rendered canvas using lossless PNG for razor-sharp clarity
 */
const buildPdfFromCanvas = ({ canvas, dim }, orientation = 'portrait') => {
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [dim.widthMm, dim.heightMm],
    compress: true
  });

  pdf.addImage(imgData, 'PNG', 0, 0, dim.widthMm, dim.heightMm, undefined, 'FAST');
  return pdf;
};

/**
 * Generates and downloads a clean, un-distorted PDF
 */
export const exportElementToPdf = async (element, options = {}) => {
  if (!element) {
    throw new Error('Target DOM element is required for PDF generation.');
  }

  const { filename = 'document.pdf', orientation = 'portrait' } = options;

  const result = await renderElementToCanvas(element, orientation);
  const pdf = buildPdfFromCanvas(result, orientation);

  pdf.save(filename);
  return pdf.output('blob');
};

/**
 * Generates in-memory PDF blob
 */
export const generatePdfBlob = async (element, options = {}) => {
  const { orientation = 'portrait' } = options;
  const result = await renderElementToCanvas(element, orientation);
  const pdf = buildPdfFromCanvas(result, orientation);
  return pdf.output('blob');
};

/**
 * Prints the document cleanly via native PDF preview iframe.
 * Avoids browser webpage printing artifacts or zoom scale distortions.
 */
export const triggerPrint = async (element, options = {}) => {
  try {
    const { orientation = 'portrait' } = options;
    const blob = await generatePdfBlob(element, { orientation });
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.src = blobUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to window.open:', printErr);
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow) {
            printWindow.onload = () => printWindow.print();
          }
        } finally {
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            URL.revokeObjectURL(blobUrl);
          }, 30000);
        }
      }, 250);
    };
  } catch (err) {
    console.error('Print generation failed:', err);
    window.print();
  }
};

/**
 * Generates standardized sanitized filename
 */
export const generatePdfFilename = (docType, candidateName, docId) => {
  const cleanName = (candidateName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const cleanId = (docId || 'DOC').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const typeTag = docType === 'CERTIFICATE' ? 'Certificate' : 'Offer_Letter';
  return `Code2Conquer_${typeTag}_${cleanName}_${cleanId}.pdf`;
};
