import React, { useState, ChangeEvent } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';

const pdfjs = require('pdfjs-dist');

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfViewer: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPdfFile(event.target.files[0]);
    }
  };

  const renderPdfPage = (pdf: PDFDocumentProxy, pageNum: number) => {
    pdf.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.getElementById('pdfCanvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({ canvasContext: context, viewport: viewport });
      }
    });
  };

  const loadPdf = () => {
    if (pdfFile) {
      const fileReader = new FileReader();

      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const typedArray = new Uint8Array(e.target.result as ArrayBuffer);

          pdfjs.getDocument({ data: typedArray }).promise.then((pdf : PDFDocumentProxy) => {
            setNumPages(pdf.numPages);
            renderPdfPage(pdf, pageNumber);
          });
        }
      };

      fileReader.readAsArrayBuffer(pdfFile);
    }
  };

  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => (numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber));
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={loadPdf}>Load PDF</button>
      <canvas id="pdfCanvas" />
      <div>
        <button onClick={goToPrevPage}>Previous Page</button>
        <button onClick={goToNextPage}>Next Page</button>
      </div>
    </div>
  );
};

export default PdfViewer;