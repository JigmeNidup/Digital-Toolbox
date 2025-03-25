'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

const CompressPdf = () => {
  const [pdfs, setPdfs] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [filename, setFilename] = useState('compressed.pdf');

  const handlePdfUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPdfs = Array.from(files).map((file) => ({
        id: uuidv4(),
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setPdfs((prevPdfs) => [...prevPdfs, ...newPdfs]);
    }
  };

  const handleRemovePdf = (id) => {
    setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== id));
  };

  const handleCompressionChange = (level) => {
    setCompressionLevel(level);
  };

  const handleFilenameChange = (event) => {
    setFilename(event.target.value);
  };

  const compressPdf = async () => {
    if (pdfs.length === 0) return;

    const pdf = pdfs[0];
    const pdfBytes = await fetch(pdf.url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // TODO: Implement actual PDF compression logic here based on compressionLevel
    // This is a placeholder as pdf-lib doesn't directly support compression
    // You might need to use a backend service or another library for this

    const compressedPdfBytes = await pdfDoc.save();
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="flex">
      <div className="flex-1 p-4">
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <div className="border-dashed border-2 border-gray-400 p-4 flex justify-center items-center">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
          id="pdf-upload"
          className="hidden"
        />
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="mt-4 border p-4 relative">
            {pdf.name}
            <button
              onClick={() => handleRemovePdf(pdf.id)}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-lg font-semibold mb-4">Compression level</h2>
        <div
          className={`border p-2 mb-2 rounded ${
            compressionLevel === 'extreme' ? 'bg-blue-500' : ''
          }`}
          onClick={() => handleCompressionChange('extreme')}
        >
          <strong>EXTREME COMPRESSION</strong>
          <p className="text-sm">Less quality, high compression</p>
        </div>
        <div
          className={`border p-2 mb-2 rounded ${
            compressionLevel === 'recommended' ? 'bg-blue-500' : ''
          }`}
          onClick={() => handleCompressionChange('recommended')}
        >
          <strong>RECOMMENDED COMPRESSION</strong>
          <p className="text-sm">Good quality, good compression</p>
        </div>
        <div
          className={`border p-2 mb-2 rounded ${
            compressionLevel === 'less' ? 'bg-blue-500' : ''
          }`}
          onClick={() => handleCompressionChange('less')}
        >
          <strong>LESS COMPRESSION</strong>
          <p className="text-sm">High quality, less compression</p>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Filename</label>
          <input
            type="text"
            value={filename}
            onChange={handleFilenameChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <button
          onClick={compressPdf}
          className="bg-red-500 text-white p-2 rounded w-full"
        >
          Compress PDF
        </button>
      </div>
    </div>
  );
};

export default CompressPdf;