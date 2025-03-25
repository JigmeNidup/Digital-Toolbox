'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const [pageOrientation, setPageOrientation] = useState('portrait');
  const [pageSize, setPageSize] = useState('a4');
  const [margin, setMargin] = useState('no');
  const [filename, setFilename] = useState('merged'); // New state for filename

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => ({
        id: uuidv4(),
        file: file,
        url: URL.createObjectURL(file),
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleRemoveImage = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  const handleOrientationChange = (orientation) => {
    setPageOrientation(orientation);
  };

  const handleSizeChange = (size) => {
    setPageSize(size);
  };

  const handleMarginChange = (marginOption) => {
    setMargin(marginOption);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const generatePdf = async () => {
    const doc = new jsPDF({
      orientation: pageOrientation,
      unit: 'mm',
      format: pageSize.toUpperCase(),
    });

    for (let i = 0; i < images.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      const img = new Image();
      img.src = images[i].url;

      await new Promise((resolve) => {
        img.onload = () => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          let imgWidth = img.width;
          let imgHeight = img.height;

          // Calculate aspect ratio
          const aspectRatio = imgWidth / imgHeight;

          // Fit image to A4 dimensions while maintaining aspect ratio
          if (aspectRatio > pageWidth / pageHeight) {
            imgWidth = pageWidth;
            imgHeight = pageWidth / aspectRatio;
          } else {
            imgHeight = pageHeight;
            imgWidth = pageHeight * aspectRatio;
          }

          // Center the image on the page
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

          resolve();
        };
      });
    }

    doc.save(`${filename}.pdf`); // Use the custom filename
  };

  const Item = ({ image, index, moveImage }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'image',
      item: { id: image.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [, drop] = useDrop(() => ({
      accept: 'image',
      hover: (item, monitor) => {
        if (item.id !== image.id) {
          moveImage(item.index, index);
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
        <img src={image.url} alt={`Image ${index + 1}`} className="w-32 h-32 object-contain" />
        <button
          onClick={() => handleRemoveImage(image.id)}
          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
        >
          x
        </button>
      </div>
    );
  };

  const moveImage = (dragIndex, hoverIndex) => {
    setImages((prevImages) => {
      const draggedImage = prevImages[dragIndex];
      const newImages = [...prevImages];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image upload and preview */}
        <div className="w-full md:w-2/3 p-4">
          <label htmlFor="image-upload" className="cursor-pointer">
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
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
            className="hidden"
          />
          <div className="flex flex-wrap mt-4">
            {images.map((image, index) => (
              <Item key={image.id} image={image} index={index} moveImage={moveImage} />
            ))}
          </div>
        </div>
        
        {/* Right side - Options panel */}
        <div className="w-full md:w-1/3 p-4 bg-black">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Image to PDF options</h2>
            <div className="mb-4">
              <label className="block mb-2">Page orientation</label>
              <div className="flex">
                <button
                  onClick={() => handleOrientationChange('portrait')}
                  className={`border p-2 rounded mr-2 ${
                    pageOrientation === 'portrait' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => handleOrientationChange('landscape')}
                  className={`border p-2 rounded ${
                    pageOrientation === 'landscape' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Page size</label>
              <select
                value={pageSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="a4">A4 (297x210 mm)</option>
                {/* Add more sizes if needed */}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Margin</label>
              <div className="flex">
                <button
                  onClick={() => handleMarginChange('no')}
                  className={`border p-2 rounded mr-2 ${
                    margin === 'no' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  No margin
                </button>
                <button
                  onClick={() => handleMarginChange('small')}
                  className={`border p-2 rounded mr-2 ${
                    margin === 'small' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => handleMarginChange('big')}
                  className={`border p-2 rounded ${
                    margin === 'big' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Big
                </button>
              </div>
            </div>
            
            {/* New filename input field */}
            <div className="mb-4">
              <label className="block mb-2">PDF Filename</label>
              <input
                type="text"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="Enter filename"
                className="border p-2 rounded w-full"
              />
            </div>
            
            <button
              onClick={generatePdf}
              className="bg-red-500 text-white p-2 rounded w-full"
            >
              Convert to PDF
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ImageToPdf;