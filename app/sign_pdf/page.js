"use client";
import { useState, useRef, useEffect } from "react";

export default function PdfSigningApp() {
  // PDF State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pdfRef = useRef(null);
  const canvasRef = useRef(null);
  const signaturePreviewRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const pdfPagesRef = useRef([]);

  // Signature State
  const [signature, setSignature] = useState(null);
  const [signatureType, setSignatureType] = useState("text");
  const [name, setName] = useState("");
  const [signatureColor, setSignatureColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);

  // Options
  const [includeDate, setIncludeDate] = useState(false);
  const [additionalText, setAdditionalText] = useState("");
  const [position, setPosition] = useState({ page: 1, x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Generate text signature whenever name, color, or size changes
  useEffect(() => {
    if (signatureType === "text" && name) {
      generateTextSignature();
    }
  }, [name, signatureColor, fontSize, signatureType]);

  // Update position inputs when signature is dragged
  useEffect(() => {
    if (signaturePreviewRef.current) {
      signaturePreviewRef.current.style.left = `${position.x}px`;
      signaturePreviewRef.current.style.top = `${position.y}px`;
    }
  }, [position]);

  const handlePositionChange = (e, field) => {
    const value = parseInt(e.target.value) || 0;
    setPosition((prev) => ({
      ...prev,
      [field]:
        field === "page"
          ? Math.max(1, Math.min(totalPages || 10, value))
          : value,
    }));
  };

  // Handle PDF Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setCurrentPage(1);
      setPosition({ page: 1, x: 100, y: 100 });
    }
  };

  // Generate Text Signature
  const generateTextSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a larger canvas to get better quality signature
    canvas.width = 600; // Double the size for better quality
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use a nice cursive font (make sure to include it in your project)
    ctx.font = `${fontSize * 2}px 'Great Vibes', cursive, sans-serif`;
    ctx.fillStyle = signatureColor;
    ctx.fillText(name, 20, 100); // Adjusted position for larger canvas

    // Convert to data URL with higher quality
    setSignature(canvas.toDataURL("image/png", 1.0));
  };

  // Handle Image Signature Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignature(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Calculate which page the signature is on based on vertical position
  const getCurrentPageFromPosition = (yPos) => {
    if (!pdfPagesRef.current.length) return 1;
    
    let cumulativeHeight = 0;
    for (let i = 0; i < pdfPagesRef.current.length; i++) {
      cumulativeHeight += pdfPagesRef.current[i].height;
      if (yPos < cumulativeHeight) {
        return i + 1; // Pages are 1-indexed
      }
    }
    return pdfPagesRef.current.length; // Default to last page
  };

  // Drag and Drop handlers
  const handleMouseDown = (e) => {
    if (!signaturePreviewRef.current) return;
    
    const rect = signaturePreviewRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !pdfContainerRef.current) return;
    
    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Constrain to container bounds
    const constrainedX = Math.max(0, Math.min(containerRect.width - 100, newX));
    const constrainedY = Math.max(0, Math.min(containerRect.height - 50, newY));
    
    // Calculate current page based on vertical position
    const currentPage = getCurrentPageFromPosition(constrainedY);
    
    setPosition(prev => ({
      ...prev,
      page: currentPage,
      x: constrainedX,
      y: constrainedY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for drag and drop
  useEffect(() => {
    if (pdfContainerRef.current) {
      pdfContainerRef.current.addEventListener('mousemove', handleMouseMove);
      pdfContainerRef.current.addEventListener('mouseup', handleMouseUp);
      pdfContainerRef.current.addEventListener('mouseleave', handleMouseUp);
      
      return () => {
        pdfContainerRef.current?.removeEventListener('mousemove', handleMouseMove);
        pdfContainerRef.current?.removeEventListener('mouseup', handleMouseUp);
        pdfContainerRef.current?.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Track PDF page dimensions
  const updatePageDimensions = () => {
    if (!pdfRef.current) return;
    
    try {
      // This is a simplified approach - in a real app you'd need to:
      // 1. Use a PDF library to get accurate page dimensions
      // 2. Or calculate based on the rendered iframe content
      
      // For demo purposes, we'll assume each page has similar height
      const iframe = pdfRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const pages = Array.from(iframeDoc.querySelectorAll('.page'));
      
      pdfPagesRef.current = pages.map(page => ({
        height: page.offsetHeight,
        top: page.offsetTop
      }));
      
      setTotalPages(pages.length);
    } catch (error) {
      console.log("Couldn't access iframe content:", error);
    }
  };

  // Set up mutation observer to track PDF rendering
  useEffect(() => {
    if (!pdfRef.current) return;
    
    const observer = new MutationObserver(updatePageDimensions);
    observer.observe(pdfRef.current, {
      attributes: true,
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [pdfUrl]);

  const generateSignedPdf = async () => {
    if (!pdfFile || !signature) return;

    try {
      // Load the pdf-lib library dynamically
      const { PDFDocument, rgb } = await import("pdf-lib");
      const { default: fontkit } = await import("@pdf-lib/fontkit");
      
      // Read the PDF file
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Register fontkit for custom fonts
      pdfDoc.registerFontkit(fontkit);
      
      // Get the page where we want to add the signature
      const pages = pdfDoc.getPages();
      const pageIndex = Math.min(position.page - 1, pages.length - 1);
      const page = pages[pageIndex];
      
      // Embed the signature image
      let signatureImage;
      const signatureBytes = await fetch(signature).then(res => res.arrayBuffer());
      signatureImage = await pdfDoc.embedPng(signatureBytes);
      
      // Calculate dimensions (scaled down from our larger canvas)
      const { width, height } = signatureImage.scale(0.5);
      
      // Draw the signature on the PDF at the dragged position
      page.drawImage(signatureImage, {
        x: position.x,
        y: page.getHeight() - position.y - height, // PDF coordinates start from bottom
        width,
        height,
      });
      
      // Add date if enabled
      if (includeDate) {
        const date = new Date().toLocaleDateString();
        page.drawText(`Date: ${date}`, {
          x: position.x,
          y: page.getHeight() - position.y - height - 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }
      
      // Add additional text if provided
      if (additionalText) {
        page.drawText(additionalText, {
          x: position.x,
          y: page.getHeight() - position.y - height - 40,
          size: 12,
          color: rgb(0, 0, 0),
        });
      }
      
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Create download link
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("An error occurred while signing the PDF. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => document.getElementById("pdf-upload").click()}
            className="p-2 bg-blue-600 rounded hover:bg-blue-700"
            title="Add PDF"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <input
            id="pdf-upload"
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <h1 className="text-xl font-bold">PDF Signing App</h1>
        </div>

        <button
          onClick={generateSignedPdf}
          disabled={!pdfFile || !signature}
          className={`px-4 py-2 rounded ${
            !pdfFile || !signature
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Sign PDF
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer (75% width) */}
        <div className="w-3/4 border-r border-gray-300 bg-white relative" ref={pdfContainerRef}>
          {pdfUrl ? (
            <div className="h-full overflow-auto p-4 relative">
              <iframe
                src={`${pdfUrl}#page=${currentPage}`}
                ref={pdfRef}
                className="w-full h-full border"
                title="PDF Viewer"
                onLoad={() => {
                  // Try to get page count from the iframe
                  setTimeout(updatePageDimensions, 1000);
                }}
              />

              {/* Signature Preview */}
              {signature && (
                <div
                  ref={signaturePreviewRef}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    opacity: isDragging ? 0.8 : 1,
                    zIndex: 10,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={signature}
                    alt="Signature Preview"
                    className="max-w-xs max-h-20"
                    draggable="false"
                  />
                  <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Page {position.page}
                  </div>
                </div>
              )}

              {/* Simple Page Navigation */}
              <div className="fixed bottom-4 left-1/4 transform -translate-x-1/2 bg-white p-2 rounded shadow flex items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="mx-4">
                  Page {currentPage} of {totalPages || "?"}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages || 10, p + 1))
                  }
                  disabled={currentPage >= (totalPages || 10)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-500">Upload a PDF to preview</p>
            </div>
          )}
        </div>

        {/* Signature Panel (25% width) */}
        <div className="w-1/4 p-4 overflow-y-auto bg-white border-l border-gray-200">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Signature</h2>

            <div className="space-y-2">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSignatureType("text")}
                  className={`px-4 py-2 rounded ${
                    signatureType === "text"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Text Signature
                </button>
                <button
                  onClick={() => setSignatureType("image")}
                  className={`px-4 py-2 rounded ${
                    signatureType === "image"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Image Signature
                </button>
              </div>

              {signatureType === "text" ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2 border rounded text-gray-800"
                  />

                  <div className="flex items-center space-x-4">
                    <label className="text-gray-700">Font Size:</label>
                    <input
                      type="range"
                      min="12"
                      max="36"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-gray-700">{fontSize}px</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-gray-700">Color:</label>
                    <input
                      type="color"
                      value={signatureColor}
                      onChange={(e) => setSignatureColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer"
                    />
                    <span className="text-gray-700">{signatureColor}</span>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border rounded text-gray-800"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-2 text-gray-800">Preview</h3>
              {signature ? (
                <div className="p-4 border rounded bg-gray-50">
                  <img
                    src={signature}
                    alt="Signature Preview"
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              ) : (
                <p className="text-gray-500">No signature generated yet</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-2 text-gray-800">Position</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Page:</label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages || 10}
                    value={position.page}
                    onChange={(e) => handlePositionChange(e, "page")}
                    className="w-20 p-1 border rounded text-gray-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">X Position:</label>
                  <input
                    type="number"
                    value={position.x}
                    onChange={(e) => handlePositionChange(e, "x")}
                    className="w-20 p-1 border rounded text-gray-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Y Position:</label>
                  <input
                    type="number"
                    value={position.y}
                    onChange={(e) => handlePositionChange(e, "y")}
                    className="w-20 p-1 border rounded text-gray-800"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Tip: Drag the signature on the PDF to position it. The page number updates automatically.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-2 text-gray-800">Additional Options</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                  />
                  <span>Include Date</span>
                </label>

                <div>
                  <label className="block mb-1 text-gray-700">Additional Text:</label>
                  <textarea
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    className="w-full p-2 border rounded text-gray-800"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}