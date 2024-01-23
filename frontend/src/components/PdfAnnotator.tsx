import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import * as pdfjs from 'pdfjs-dist';

const PdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [lines, setLines] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const handleAnnotation = (canvas: HTMLCanvasElement, pageIndex: number) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    annotations
      .filter((ann) => ann.pageIndex === pageIndex)
      .forEach((ann) => {
        context.beginPath();
        context.rect(ann.left, ann.top, ann.width, ann.height);
        context.lineWidth = 2;
        context.strokeStyle = 'blue';
        context.stroke();
      });
  };

  const handleDrawing = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(lines[0].x, lines[0].y);
    context.lineTo(lines[1].x, lines[1].y);
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.stroke();
  };

  const onRenderSuccess = (pdf: pdfjs.PDFDocumentProxy) => {
    const newAnnotations: any[] = [];

    pdf.getPage(pageNumber).then((page) => {
      annotations.forEach((ann) => {
        if (ann.pageIndex === pageNumber - 1) {
          newAnnotations.push(ann);
        }
      });

      setAnnotations(newAnnotations);
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (drawing) {
      setLines([...lines, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDrawing(true);
    setLines([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
  };

  const onMouseUp = () => {
    setDrawing(false);
    setAnnotations([...annotations, ...lines]);
    setLines([]);
  };

  return (
    <div style={{ border: '1px solid rgba(0, 0, 0, 0.3)', height: '750px' }}>
      <Viewer fileUrl={pdfUrl} />
      <canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={600} // Adjust the canvas size as needed
        height={800}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
    </div>
  );
};

const pdfWorkerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const PdfAnnotator: React.FC = () => {
  const [pdfFileList, setPdfFileList] = useState<Array<File>>([]);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  const getUrl = (file: File) => {
    const blob = new Blob([file]);
    const pdfUrl = URL.createObjectURL(blob);
    setPdfUrl(pdfUrl);
  };

  const onPdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedList: Array<File> = Array.from(e.target.files || []);
    const getAddList = selectedList.map((item) => item);
    getUrl(getAddList[0]);
    setPdfFileList(selectedList);
  };

  const onDeleteTarget = () => {
    setPdfFileList([]);
    setPdfUrl(undefined);
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div>
      <Worker workerUrl={pdfWorkerUrl}>
        <div>
          <div>
            <button onClick={onDeleteTarget}>Delete PDF</button>
          </div>
          <div>
            {pdfFileList.length > 0 ? (
              <div>
                <PdfViewer pdfUrl={pdfUrl!} />
                <p>
                  Page {pageNumber} of {pdfFileList.length}
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="uploadFile">Upload PDF</label>
                <input type="file" id="uploadFile" accept="application/pdf" onChange={onPdfFileUpload} />
              </div>
            )}
          </div>
        </div>
      </Worker>
    </div>
  );
};

export default PdfAnnotator;
