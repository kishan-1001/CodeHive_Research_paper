import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, ExternalLink, MousePointer2, AlertCircle, Download } from 'lucide-react';

// Use guaranteed stable worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFPageProps {
  children?: React.ReactNode;
}

const PDFPage = React.forwardRef<HTMLDivElement, PDFPageProps>((props, ref) => {
  return (
    <div className="page bg-white" ref={ref}>
      <div className="w-full h-full flex items-start justify-center overflow-hidden">
        {props.children}
      </div>
    </div>
  );
});

function App() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error, setError] = useState<string | null>(null);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = () => {
    setError('COULD NOT SYNCHRONIZE PDF DATA. PLEASE REFRESH THE ENVIRONMENT.');
  };

  const onFlip = useCallback((e: any) => {
    setPageNumber(e.data + 1);
  }, []);

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/researchpaper.pdf';
    link.download = 'ResearchPaper.pdf';
    link.click();
  };

  const isMobile = windowSize.width < 1024;
  const headerHeight = 84;
  const footerHeight = 44;
  const padding = 80;

  const availableHeight = windowSize.height - headerHeight - footerHeight - padding;
  const availableWidth = windowSize.width - padding;

  // Standard A4 aspect ratio 1.414
  const bookHeight = Math.max(400, availableHeight);
  const totalBookWidth = isMobile ? availableWidth : Math.min(availableWidth, bookHeight * 1.414);
  const actualPageWidth = isMobile ? totalBookWidth : totalBookWidth / 2;

  return (
    <div className="h-screen w-full bg-darkBase text-slate-100 flex flex-col font-outfit overflow-hidden relative">
      {/* High-End Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.03] rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/[0.04] rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      <header className="z-30 h-16 w-full px-6 md:px-10 flex justify-between items-center bg-darkBase/40 backdrop-blur-2xl border-b border-glassBorder shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md overflow-hidden p-[2px]">
            <img src="/kiri_.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md rounded-[10px]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[16px] font-semibold text-white tracking-wide leading-tight font-outfit">CodeHive Research</h1>
            <a
              href="https://mycodehive.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-slate-400 hover:text-white transition-all flex items-center gap-1 opacity-100 group font-inter"
            >
              mycodehive.in
              <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto flex flex-col items-center justify-start p-10 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
        {error && (
          <div className="my-auto bg-red-500/10 border border-red-500/50 text-red-200 px-8 py-6 rounded-3xl backdrop-blur-3xl flex flex-col items-center gap-4 z-50">
            <AlertCircle size={40} className="text-red-500" />
            <div className="flex flex-col items-center gap-1">
              <p className="font-black text-sm tracking-widest uppercase">{error}</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">REFRESH</button>
          </div>
        )}

        <div className="relative transition-transform duration-300 ease-out flex flex-col items-center" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <div className="relative group" style={{ width: totalBookWidth }}>
            <div className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] sm:rounded-lg overflow-hidden bg-white ring-1 ring-white/10 transition-transform duration-500">
              <Document
                file="/researchpaper.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="h-[600px] w-[800px] flex items-center justify-center bg-[#0d1117]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>}
              >
                {numPages && (
                  // @ts-ignore
                  <HTMLFlipBook
                    width={actualPageWidth}
                    height={bookHeight}
                    size="fixed"
                    showCover={true}
                    onFlip={onFlip}
                    ref={bookRef}
                    usePortrait={isMobile}
                    drawShadow={true}
                    flippingTime={1000}
                    useMouseEvents={true}
                    style={{ backgroundColor: '#fff' }}
                  >
                    {[...Array(numPages)].map((_, index) => (
                      <PDFPage key={index}>
                        <Page
                          key={`page-${index + 1}`}
                          pageNumber={index + 1}
                          width={actualPageWidth}
                          devicePixelRatio={3}
                          renderAnnotationLayer={false}
                          renderTextLayer={true}
                          className="pdf-page-render"
                          loading={null}
                        />
                      </PDFPage>
                    ))}
                  </HTMLFlipBook>
                )}
              </Document>
            </div>

          </div>

          {/* Glassmorphic Minimalist Dock */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-darkBase/60 backdrop-blur-2xl border border-glassBorder rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all hover:bg-darkBase/70">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white/[0.03] rounded-2xl p-1 border border-white/[0.05]">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 sm:p-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/10 hover:text-white active:scale-95">
                <ZoomOut size={16} />
              </button>
              <div className="w-10 sm:w-12 text-center text-xs font-semibold text-white tracking-wide font-inter">
                {Math.round(zoom * 100)}%
              </div>
              <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-2 sm:p-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/10 hover:text-white active:scale-95">
                <ZoomIn size={16} />
              </button>
            </div>
            
            <div className="w-px h-6 sm:h-8 bg-glassBorder mx-0.5 sm:mx-1"></div>
            
            {/* Navigation Controls */}
            <div className="flex items-center bg-white/[0.03] rounded-2xl p-1 border border-white/[0.05]">
              <button 
                onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                disabled={pageNumber === 1}
                className="p-2 sm:p-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="px-2 sm:px-3 flex items-center gap-1.5 text-xs font-medium font-inter">
                <span className="text-white w-4 text-center">{pageNumber}</span>
                <span className="text-slate-500">of</span>
                <span className="text-slate-400">{numPages || '-'}</span>
              </div>
              
              <button 
                onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                disabled={numPages ? pageNumber >= numPages - 1 : true}
                className="p-2 sm:p-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="w-px h-6 sm:h-8 bg-glassBorder mx-0.5 sm:mx-1"></div>
            
            {/* Download Button */}
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center p-2.5 sm:px-5 sm:py-3 gap-2 bg-white text-darkBase hover:bg-slate-200 rounded-2xl transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold tracking-wide hidden sm:block font-inter">Download</span>
            </button>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .flip-book {
          background-color: #fff;
        }
        .page {
          background-color: white;
          box-shadow: inset 0 0 100px rgba(0,0,0,0.02);
          display: flex !important;
          flex-direction: column !important;
        }
        .pdf-page-render {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: start !important;
        }
        .pdf-page-render canvas {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
          image-rendering: high-quality;
          box-shadow: 0 0 40px rgba(0,0,0,0.05);
        }
        .react-pdf__Page__textContent {
          pointer-events: none;
          opacity: 0.05;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
        .react-pdf__Page__annotations {
          display: none !important;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}} />
    </div>
  );
}

export default App;
