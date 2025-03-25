'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

const MergePdf = () => {
  const [pdfs, setPdfs] = useState([]);
  const [filename, setFilename] = useState('merged.pdf');

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

  const handleFilenameChange = (event) => {
    setFilename(event.target.value);
  };

  const mergePdfs = async () => {
    const mergedPdf = await PDFDocument.create();

    for (const pdf of pdfs) {
      const pdfBytes = await fetch(pdf.url).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const Item = ({ pdf, index, movePdf }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'pdf',
      item: { id: pdf.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: 'pdf',
      hover: (item, monitor) => {
        if (item.id !== pdf.id) {
          movePdf(item.index, index);
          item.index = index;
        }
      },
    }));

    return (
      <div
        ref={(node) => drag(drop(node))}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
        className="relative border p-2 m-2"
      >
        <div className="w-32 h-32 flex items-center justify-center bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-center mt-2">{pdf.name}</p>
        <button
          onClick={() => handleRemovePdf(pdf.id)}
          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
        >
          x
        </button>
      </div>
    );
  };

  const movePdf = (dragIndex, hoverIndex) => {
    setPdfs((prevPdfs) => {
      const draggedPdf = prevPdfs[dragIndex];
      const newPdfs = [...prevPdfs];
      newPdfs.splice(dragIndex, 1);
      newPdfs.splice(hoverIndex, 0, draggedPdf);
      return newPdfs;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
            multiple
            accept="application/pdf"
            onChange={handlePdfUpload}
            id="pdf-upload"
            className="hidden"
          />
          <div className="flex flex-wrap mt-4">
            {pdfs.map((pdf, index) => (
              <Item key={pdf.id} pdf={pdf} index={index} movePdf={movePdf} />
            ))}
          </div>
        </div>
        <div className="w-1/3 p-4">
          <h2 className="text-lg font-semibold mb-4">Merge PDF</h2>
          <p className="mb-4">
            To change the order of your PDFs, drag and drop the files as you want.
          </p>
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
            onClick={mergePdfs}
            className="bg-red-500 text-white p-2 rounded w-full"
          >
            Merge PDF
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default MergePdf;