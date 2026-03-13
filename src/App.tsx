import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, ExternalLink, MousePointer2, AlertCircle } from 'lucide-react';

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
    <div className="h-screen w-full bg-[#02040a] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[80%] bg-blue-600/[0.08] rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[80%] bg-indigo-600/[0.08] rounded-full blur-[180px]"></div>
      </div>

      <header className="z-30 h-20 w-full px-10 flex justify-between items-center bg-[#0d1117]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#4f46e5] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transform rotate-2">
            <span className="font-black text-white text-2xl italic tracking-tighter">C</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black text-white tracking-[0.15em] leading-none uppercase">CODEHIVE RESEARCH PAPER</h1>
            <a
              href="https://mycodehive.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1.5 opacity-90 group"
            >
              mycodehive.in
              <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-white/5 rounded-2xl px-3 py-1.5 border border-white/10 backdrop-blur-md">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white active:scale-90">
              <ZoomOut size={18} />
            </button>
            <span className="px-4 text-[11px] font-black min-w-[3.5rem] text-center text-slate-200">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white active:scale-90">
              <ZoomIn size={18} />
            </button>
          </div>

          <button
            onClick={downloadPDF}
            className="group relative overflow-hidden bg-[#2563eb] hover:bg-[#3b82f6] text-white px-7 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_25px_rgba(37,99,235,0.3)] active:scale-95"
          >
            <span className="relative z-10">Download</span>
          </button>
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
          {/* Navigation Contols */}
          <div className="absolute left-[-120px] top-1/2 -translate-y-1/2 z-30 hidden 2xl:block">
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
              disabled={pageNumber === 1}
              className="p-6 bg-slate-900/40 hover:bg-slate-800 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] transition-all disabled:opacity-0 group"
            >
              <ChevronLeft size={44} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 z-30 hidden 2xl:block">
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
              disabled={numPages ? pageNumber >= numPages - 1 : true}
              className="p-6 bg-slate-900/40 hover:bg-slate-800 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] transition-all disabled:opacity-0 group"
            >
              <ChevronRight size={44} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden bg-white border border-white/10">
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

          {/* Interaction Guide */}
          <div className="mt-16 mb-20 flex flex-col items-center gap-6 scale-[1] sm:scale-100 origin-top">
            <div className="flex items-center gap-10 bg-white/5 backdrop-blur-3xl border border-white/10 px-12 py-5 rounded-full shadow-2xl group hover:bg-white/10 transition-all cursor-default">
              <div className="flex items-center gap-4">
                <MousePointer2 size={18} className="text-blue-500 animate-bounce" />
                <span className="text-[12px] font-black text-white tracking-[0.3em] uppercase">
                  {isMobile ? 'SWIPE TO TURN' : 'CLICK CORNER TO TURN'}
                </span>
              </div>
              <div className="h-5 w-[1px] bg-white/20"></div>
              <span className="text-base font-black text-slate-300 tracking-[0.1em] font-mono tabular-nums">
                <span className="text-blue-400">{pageNumber}</span> <span className="text-slate-600 mx-1">/</span> {numPages || '--'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.6em] uppercase opacity-60">
              ULTRA-HIGH DEFINITION REPOSITORY
            </p>
          </div>
        </div>
      </main>

      <footer className="h-11 w-full bg-[#0d1117]/95 border-t border-white/10 flex items-center justify-center px-10 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></div>
          <p className="text-[9px] font-black text-slate-600 tracking-[0.4em] uppercase">CONNECTION SECURE • ULTRA-RES ACTIVE</p>
        </div>
      </footer>

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
        h1 {
          background: linear-gradient(to right, #fff, #64748b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />
    </div>
  );
}

export default App;
