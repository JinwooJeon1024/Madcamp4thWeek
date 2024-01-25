import React, { useState, useEffect, useRef } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import rough from 'roughjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import UseSpeechToText from '../UseSpeechtoText';
import axios from 'axios';

const pdfjs = require('pdfjs-dist');
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

let elementId = 0;

interface Element {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  roughElement?: any;
}

interface TextElement extends Element {
  text: string;
}

type SelectedElement = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offsetX: number;
  offsetY: number;
  type: string;
  text?: string;
}

function createElement(id: number, x1: number, y1: number, x2: number, y2: number, type: string, text?: string): Element | TextElement {
  if (type === 'text' && text !== undefined) {
    return { id, x1, y1, x2, y2, type, text };
  } else {
    const generator = rough.generator();
    const roughElement =
      type === 'line' ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { id, x1, y1, x2, y2, type, roughElement };
  }
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

const isWithinTextElement = (x: number, y: number, textElement: { x: number, y: number, text: string }, context: CanvasRenderingContext2D) => {
  context.font = '16px Arial';
  const textWidth = context.measureText(textElement.text).width;
  const textHeight = 20;
  return x >= textElement.x && x <= textElement.x + textWidth && y >= textElement.y - textHeight && y <= textElement.y;
};

const distance = (a: any, b: any) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

const getElementAtPosition = (x: number, y: number, elements: Element[]) => {
  return elements.find((element) => isWithinElement(x, y, element));
};


const PdfViewerWithDrawing: React.FC = () => {
  const [language, setLanguage] = useState<string>('en-US');
  const { transcript, listening, toggleListening } = UseSpeechToText(language);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageElements, setPageElements] = useState<{ [pageNum: number]: Element[] }>({});
  const [action, setAction] = useState<string>("none");
  const [tool, setTool] = useState<string>("line")
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [roughCanvases, setRoughCanvases] = useState<any[]>([]); // Array to hold RoughJS canvases for each page
  const [modifiedLines, setModifiedLines] = useState<string[]>([]);
  const [textElements, setTextElements] = useState<{ [pageNum: number]: { x: number, y: number, text: string }[] }>({});
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [editableTextElement, setEditableTextElement] = useState<TextElement | null>(null);

  useEffect(() => {
    if (pdfFile) {
      loadPdf(pdfFile);
    }
  }, [pdfFile]);

  const drawOnCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement, roughCanvas: any, elements: Element[], textElements: { x: number, y: number, text: string }[]) => {
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

        context.font = '16px Arial';
        textElements.forEach(textElement => {
          context.fillText(textElement.text, textElement.x, textElement.y);
        });
      } catch (error) {
        console.error('Error rendering image on the canvas:', error);
      }
    }
  };

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;

    if (imageCanvas) {
      const img = new Image();
      img.src = pdfImages[pageNumber - 1];
      img.onload = () => {
        const roughCanvas = roughCanvases[pageNumber - 1];
        const currentPageElements = pageElements[pageNumber] || [];
        const currentPageTextElements = textElements[pageNumber] || [];
        drawOnCanvas(imageCanvas, img, roughCanvas, currentPageElements, currentPageTextElements);
      };
    }
  }, [pageNumber, pdfImages, pageElements, textElements, roughCanvases]);

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

  const handleMouseDown = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event.nativeEvent;
    const rect = imageCanvasRef.current?.getBoundingClientRect();
    const currentPageElements = pageElements[pageNumber] || [];
    const currentPageTextElements = textElements[pageNumber] || [];
    const context = imageCanvasRef.current?.getContext('2d');

    if (rect && context) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const element = getElementAtPosition(x, y, currentPageElements)
      const textElement = currentPageTextElements.find(te => isWithinTextElement(x, y, te, context));

      if (tool === 'selection') {
        if (element) {
          const offsetX = x - element.x1;
          const offsetY = y - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
          setAction('moving');
          console.log('element moving');
        } else if (textElement) {
          const offsetX = x - textElement.x;
          const offsetY = y - textElement.y;
          setSelectedElement({
            id: elementId++,
            x1: textElement.x,
            y1: textElement.y,
            x2: textElement.x + 100, y2: textElement.y + 20,
            type: 'text',
            text: textElement.text,
            offsetX, offsetY
          });
          setAction('moving');
          console.log('text_element moving');
        } else {
          setAction('none');
          setSelectedElement(null);
          console.log('nothing')
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
        } else if (textElement) {
          setTextElements(prevTextElements => {
            const updatedTextElements = currentPageTextElements.filter(te => te !== textElement);
            return { ...prevTextElements, [pageNumber]: updatedTextElements };
          });
          setAction('none');
          setSelectedElement(null);
        } else {
          setAction('none');
          setSelectedElement(null);
        }
      } else if (tool === 'edit') {
        const textElement = currentPageTextElements.find(te => isWithinTextElement(x, y, te, context));
        if (textElement) {
          const editableElement: TextElement = {
            id: elementId++,
            x1: textElement.x,
            y1: textElement.y,
            x2: textElement.x + 100,
            y2: textElement.y + 20,
            type: 'text',
            text: textElement.text
          };
          setEditableTextElement(editableElement);
        } else {
          setEditableTextElement(null);
        }
      } else if (tool === 'translate' && textElement) {
        try {
          const translatedText = await translateText(textElement.text);
          setTextElements(prev => {
            const updatedTextElements = currentPageTextElements.map(te => {
              if (te === textElement) {
                return { ...te, text: translatedText };
              }
              return te;
            });
            return { ...prev, [pageNumber]: updatedTextElements };
          });
        } catch (error) {
          console.error('Error translating text:', error);
        }
      }
      else {
        const id = elementId++;
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
    const currentPageTextElements = textElements[pageNumber] || [];

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
        if (selectedElement.type === 'text') {
          const newTextElements = currentPageTextElements.map(te => {
            if (te.text === selectedElement.text) {
              return { ...te, x: x - selectedElement.offsetX, y: y - selectedElement.offsetY };
            }
            return te;
          });
          setTextElements({ ...textElements, [pageNumber]: newTextElements });
        } else {
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
    }
  };

  const handleMouseUp = () => {
    setAction("none");
    setSelectedElement(null);
  };

  const renderEditableTextField = () => {
    if (editableTextElement) {
      const inputFieldHeight = 20;

      return (
        <input
          type="text"
          value={editableTextElement.text}
          style={{
            position: 'absolute',
            left: `${editableTextElement.x1}px`,
            top: `${editableTextElement.y1}px`,
            height: `${inputFieldHeight}px`
          }}
          onChange={(e) => {
            const updatedText = e.target.value;
            if (editableTextElement) {
              setEditableTextElement({ ...editableTextElement, text: updatedText });
            }
            setTextElements(prev => {
              const currentPageTextElements = prev[pageNumber] || [];
              const updatedTextElements = currentPageTextElements.map(te => {
                if (te.x === editableTextElement.x1 && te.y === editableTextElement.y1) {
                  return { ...te, text: updatedText };
                }
                return te;
              });
              return { ...prev, [pageNumber]: updatedTextElements };
            });
          }}
        />
      );
    }
    return null;
  };

  const [processedLines, setProcessedLines] = useState<string[]>([]);
  const [currentY, setCurrentY] = useState<number>(150);

  const addTextToCanvas = (text: string, y: number) => {
    const x = 150;

    setTextElements((prevTextElements) => {
      const currentPageTextElements = prevTextElements[pageNumber] || [];
      return { ...prevTextElements, [pageNumber]: [...currentPageTextElements, { x, y, text }] };
    });

    setProcessedLines((prevLines) => [...prevLines, text]);
    setCurrentY(y + 30);
  };

  function splitText(text: string) {
    const regex = /(요|니다|죠|냐)/g;

    let parts = text.split(regex);

    let result = [];

    for (let i = 0; i < parts.length; i += 2) {
      let sentence = (parts[i] + (parts[i + 1] || '')).trim();
      if (sentence !== '') {
        result.push(sentence);
      }
    }

    return result;
  }
  const splitEnglishText = (text: string) => {
    const words = text.split(' ');
    let sentences = [];
    for (let i = 0; i < words.length; i += 10) {
      sentences.push(words.slice(i, i + 10).join(' '));
    }
    return sentences;
  };

  const [sentences, setSentences] = useState<string[]>([]);

  useEffect(() => {
    if (listening) {
      const newSentences = language === 'en-US' ?
        splitEnglishText(transcript) :
        splitText(transcript);
      setSentences(newSentences);
    }
  }, [transcript, listening, language]);

  useEffect(() => {
    if (sentences.length > 1) {
      const secondLastSentence = sentences[sentences.length - 2];
      addTextToCanvas(secondLastSentence, currentY);
    }
  }, [sentences.length]);

  const handleSpeechButtonClick = () => {
    toggleListening();
    if (!listening) {
      setModifiedLines([]);
    } else {
      addTextToCanvas(sentences[sentences.length - 1], currentY);
    }
  };
  const convertToPdf = async () => {
    const imgConst = new Image();
    imgConst.src = pdfImages[numPages! - 1];
    const pdf = new jsPDF('p', 'px', [imgConst.width, imgConst.height]);

    try {
      if (numPages) {
        for (let i = 1; i <= numPages; i++) {
          const currentPageElements = pageElements[i] || [];
          const currentPageTextElements = textElements[i] || [];

          // Create a new canvas for the current page
          const combinedCanvas = document.createElement('canvas');
          const combinedContext = combinedCanvas.getContext('2d');

          if (combinedContext) {
            const img = new Image();
            img.src = pdfImages[i - 1];

            // Wait for the image to load
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            });

            // Set the canvas size to match the image size
            combinedCanvas.width = img.width;
            combinedCanvas.height = img.height;

            // Draw the image on the combined canvas
            combinedContext.drawImage(img, 0, 0);

            // Iterate through elements and draw them on the combined canvas
            currentPageElements.forEach(({ x1, y1, x2, y2, type, roughElement }) => {
              if (type === 'line') {
                combinedContext.beginPath();
                combinedContext.moveTo(x1, y1);
                combinedContext.lineTo(x2, y2);
                combinedContext.stroke();
              } else if (type === 'rectangle') {
                combinedContext.strokeRect(x1, y1, x2 - x1, y2 - y1);
              } else if (type === 'html') {
                // Use html2canvas to render HTML element on the canvas
                html2canvas(roughElement.firstChild).then(canvas => {
                  combinedContext.drawImage(canvas, x1, y1);
                });
              }
            });
            currentPageTextElements.forEach(({ x, y, text }) => {
              combinedContext.fillText(text, x, y);
            });

            // Convert the combined canvas to an image
            const imgData = combinedCanvas.toDataURL('image/png');

            // Add the image to the PDF
            pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);

            // Add a new page if not the last page
            if (i < numPages) {
              pdf.addPage();
            }
          }
        }
      }

      pdf.save('converted.pdf');
    } catch (error) {
      console.error('Error converting to PDF:', error);
    }
  };
  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(e.target.value);
  };

  const translateText = async (text: string): Promise<string> => {
    try {
      const response = await axios.post('http://localhost:5000/translate', { text });
      return response.data.translatedText;
    } catch (error) {
      console.error('Error during translation request:', error);
      return '';
    }
  };

  return (
    <div>
      {renderEditableTextField()}
      <input type="file" onChange={onFileChange} />
      <div>
        <div>
          <label>
            <input
              type="radio"
              value="en-US"
              checked={language === 'en-US'}
              onChange={handleLanguageChange}
            />
            English
          </label>
          <label>
            <input
              type="radio"
              value="ko-KR"
              checked={language === 'ko-KR'}
              onChange={handleLanguageChange}
            />
            한국어
          </label>
        </div>
        <button onClick={handleSpeechButtonClick}>
          {listening ? '음성인식 중지' : '음성인식 시작'}
        </button>
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
        <input
          type="radio"
          id="edit"
          checked={tool === 'edit'}
          onChange={() => setTool('edit')}
        />
        <label htmlFor="edit">Edit</label>
        <input
          type="radio"
          id="translate"
          checked={tool === 'translate'}
          onChange={() => setTool('translate')}
        />
        <label htmlFor="translate">Translate</label>
      </div>
      <div>
        <canvas
          ref={imageCanvasRef}
          className="image-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      <div>
        <button onClick={goToPrevPage} disabled={pageNumber === 1}>
          Previous Page
        </button>
        <button onClick={goToNextPage} disabled={pageNumber === numPages}>
          Next Page
        </button>
        <button onClick={convertToPdf}>
          Convert to Pdf
        </button>
      </div>
    </div>
  );
};

export default PdfViewerWithDrawing;