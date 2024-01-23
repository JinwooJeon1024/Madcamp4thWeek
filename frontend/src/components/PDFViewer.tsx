import React, { useState, useEffect, useRef } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import rough from 'roughjs';

const pdfjs = require('pdfjs-dist');
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Element {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  roughElement: any;
}

interface SelectedElement extends Element {
  offsetX: number;
  offsetY: number;
}

function createElement(id: number, x1: number, y1: number, x2: number, y2: number, type: string): Element {
  const generator = rough.generator();
  const roughElement =
    type === 'line' ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { id, x1, y1, x2, y2, type, roughElement };
}

const isWithinElement = (x: number, y: number, element: Element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1;
  }
};

const distance = (a: any, b: any) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

const getElementAtPosition = (x: number, y: number, elements: Element[]) => {
  return elements.find((element) => isWithinElement(x, y, element));
};


const PdfViewerWithDrawing: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageElements, setPageElements] = useState<{ [pageNum: number]: Element[] }>({});
  const [action, setAction] = useState<string>("none");
  const [tool, setTool] = useState<string>("line")
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
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

        const roughCanvasInstance = rough.canvas(canvas);

        if (roughCanvas) {
          elements.forEach(({ roughElement }) => {
            roughCanvasInstance.draw(roughElement);
          });
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
        const currentPageElements = pageElements[pageNumber] || [];
        drawOnCanvas(imageCanvas, img, roughCanvas, currentPageElements);
      };
    }
  }, [pageNumber, pdfImages, pageElements, roughCanvases]);

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
    const { clientX, clientY } = event.nativeEvent;
    const rect = imageCanvasRef.current?.getBoundingClientRect();
    const currentPageElements = pageElements[pageNumber] || [];

    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const element = getElementAtPosition(x, y, currentPageElements);

      if (tool === 'selection') {
        if (element) {
          const offsetX = x - element.x1;
          const offsetY = y - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
          setAction('moving');
        } else {
          setAction('none');
          setSelectedElement(null);
        }
      } else if (tool === 'delete') {
        if (element) {
          const offsetX = x - element.x1;
          const offsetY = y - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
          setPageElements(prevPageElements => {
            const updatedPageElements = { ...prevPageElements };
            updatedPageElements[pageNumber] = currentPageElements.filter(el => el.id !== element.id);
            return updatedPageElements;
          })
        } else {
          setAction('none');
          setSelectedElement(null);
        }
      }
      else {
        const id = currentPageElements.length;
        const element = createElement(id, x, y, x, y, tool);
        setPageElements(prevPageElements => {
          return { ...prevPageElements, [pageNumber]: [...currentPageElements, element] }
        })
        setAction("drawing");
      }
    }

  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event.nativeEvent;
    const rect = imageCanvasRef.current?.getBoundingClientRect();
    const currentPageElements = pageElements[pageNumber] || [];

    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (tool === 'selection' && action !== "drawing") {
        const canvas = event.target as HTMLCanvasElement;
        canvas.style.cursor = getElementAtPosition(x, y, currentPageElements) ? 'move' : 'default';
      } else if (tool === 'delete') {
        const canvas = event.target as HTMLCanvasElement;
        canvas.style.cursor = getElementAtPosition(x, y, currentPageElements)
          ? 'pointer'
          : 'default';
      }

      if (action === "drawing") {
        const index = currentPageElements.length - 1;
        const { x1, y1 } = currentPageElements[index];
        const newElement = createElement(index, x1, y1, x, y, tool);

        setPageElements(prevPageElements => {
          const updatedPageElements = [...(prevPageElements[pageNumber] || [])];
          updatedPageElements[index] = newElement;
          return { ...prevPageElements, [pageNumber]: updatedPageElements };
        });
      } else if (action === "moving" && selectedElement) {
        const { id, x1, y1, type, offsetX, offsetY } = selectedElement;
        const width = selectedElement.x2 - x1;
        const height = selectedElement.y2 - y1;
        const newX1 = x - offsetX;
        const newY1 = y - offsetY;

        setPageElements(prevPageElements => {
          const updatedPageElements = [...(prevPageElements[pageNumber] || [])];
          updatedPageElements[id] = createElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
          return { ...prevPageElements, [pageNumber]: updatedPageElements };
        });
      }
    }
  };


  const handleMouseUp = () => {
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <div>
        <input
          type="radio"
          id="selection"
          checked={tool === 'selection'}
          onChange={() => setTool('selection')}
        />
        <label htmlFor="selection">Selection</label>
        <input
          type="radio"
          id="line"
          checked={tool === 'line'}
          onChange={() => setTool('line')}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={tool === 'rectangle'}
          onChange={() => setTool('rectangle')}
        />
        <label htmlFor="rectangle">Rectangle</label>
        <input
          type="radio"
          id="delete"
          checked={tool === 'delete'}
          onChange={() => setTool('delete')}
        />
        <label htmlFor="delete">Delete</label>
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