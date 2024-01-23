import React, { useState, useEffect, useRef } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import rough from 'roughjs';

const pdfjs = require('pdfjs-dist');
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Element {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: any;
}

function createElement(x1: number, y1: number, x2: number, y2: number, type: string): Element {
  const generator = rough.generator();
  const roughElement =
    type === 'line' ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { x1, y1, x2, y2, roughElement };
}

const PdfViewerWithDrawing: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [elementType, setElementType] = useState<string>('line');
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [roughCanvases, setRoughCanvases] = useState<any[]>([]); // Array to hold RoughJS canvases for each page

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);

  

  useEffect(() => {
    if (pdfFile) {
      loadPdf(pdfFile);
    }
  }, [pdfFile]);

// Add a new function for drawing on the canvas
const drawOnCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement, roughCanvas: any, elements: Element[]) => {
  const context = canvas.getContext('2d');

  if (context) {
    try {
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      if (roughCanvas) {
        const roughCanvasInstance = rough.canvas(canvas);
        elements.forEach(({ roughElement }) => roughCanvasInstance.draw(roughElement));
      } else {
        console.error('RoughJS canvas for the current page is not available.');
      }
    } catch (error) {
      console.error('Error rendering image on the canvas:', error);
    }
  }
};

// Modify your useEffect to use the new function
useEffect(() => {
  const imageCanvas = imageCanvasRef.current;

  if (imageCanvas) {
    const img = new Image();
    img.src = pdfImages[pageNumber - 1];
    img.onload = () => {
      const roughCanvas = roughCanvases[pageNumber - 1];
      drawOnCanvas(imageCanvas, img, roughCanvas, elements);
    };
  }
}, [pageNumber, pdfImages, elements, roughCanvases]);


  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPdfFile(event.target.files[0]);
      setPageNumber(1);
    }
  };

  const renderPdfPages = async (pdf: PDFDocumentProxy) => {
    const images: string[] = [];
    const canvases: any[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const dataURL = await renderPdfPage(pdf, i);
      images.push(dataURL);

      // Create a RoughJS canvas for each page
      const roughCanvas = rough.canvas(document.createElement('canvas'));
      canvases.push(roughCanvas);
    }

    setPdfImages(images);
    setRoughCanvases(canvases);
  };

  const renderPdfPage = async (pdf: PDFDocumentProxy, pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const pdfCanvas = document.createElement('canvas');
    const context = pdfCanvas.getContext('2d');

    if (context) {
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Return the data URL after rendering is complete
      return pdfCanvas.toDataURL();
    }

    return '';
  };

  const loadPdf = (file: File) => {
    const fileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        const typedArray = new Uint8Array(e.target.result as ArrayBuffer);

        pdfjs.getDocument({ data: typedArray }).promise.then(async (pdf: PDFDocumentProxy) => {
          try {
            setNumPages(pdf.numPages);
            setPdfImages([]);
            setRoughCanvases([]);
            await renderPdfPages(pdf);
          } catch (error) {
            console.error('Error rendering PDF pages:', error);
          }
        });
      }
    };

    fileReader.readAsArrayBuffer(file);
  };
  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => (numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { clientX, clientY } = event.nativeEvent;
    const rect = imageCanvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const element = createElement(x, y, x, y, elementType);
      setElements((prevState) => [...prevState, element]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing) {
      const { clientX, clientY } = event.nativeEvent;
      const rect = imageCanvasRef.current?.getBoundingClientRect();
  
      if (rect) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        const updatedElement = createElement(x1, y1, x, y, elementType);
  
        const elementsCopy = [...elements];
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
      }
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <div>
        <input
          type="radio"
          id="line"
          checked={elementType === 'line'}
          onChange={() => setElementType('line')}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={elementType === 'rectangle'}
          onChange={() => setElementType('rectangle')}
        />
        <label htmlFor="rectangle">Rectangle</label>
      </div>

      <canvas
        ref={imageCanvasRef}
        className="image-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div>
        <button onClick={goToPrevPage} disabled={pageNumber === 1}>
          Previous Page
        </button>
        <button onClick={goToNextPage} disabled={pageNumber === numPages}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default PdfViewerWithDrawing;
