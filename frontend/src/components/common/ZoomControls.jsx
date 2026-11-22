import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export const ZoomControls = ({ zoom, setZoom, min = 0.4, max = 1.6, step = 0.1 }) => {
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(max, Math.round((prev + step) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(min, Math.round((prev - step) * 10) / 10));
  };

  const handleReset = () => {
    setZoom(1.0);
  };

  const handleFit = () => {
    setZoom(0.75);
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm rounded-lg p-1 text-slate-700">
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={zoom <= min}
        title="Zoom Out"
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="text-xs font-mono font-medium px-2 min-w-[3.5rem] text-center select-none">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={handleZoomIn}
        disabled={zoom >= max}
        title="Zoom In"
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={handleFit}
        title="Fit Preview"
        className="p-1.5 rounded hover:bg-slate-100 text-xs font-medium transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={handleReset}
        title="Reset Zoom (100%)"
        className="p-1.5 rounded hover:bg-slate-100 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ZoomControls;
