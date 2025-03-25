"use client";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { removeBackground } from "@imgly/background-removal";

const RemoveBg = () => {
  const [images, setImages] = useState([]);
  const [filename, setFilename] = useState("removed-bg");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleRemoveBackground = async () => {
    if (images.length === 0 || isProcessing) return;

    setIsProcessing(true);

    try {
      const imageBlob = await removeBackground(images[0].url);
      const url = URL.createObjectURL(imageBlob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilenameChange = (event) => {
    setFilename(event.target.value);
  };

  return (
    <div className="flex">
      <div className="flex-1 p-4">
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
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          id="image-upload"
          className="hidden"
          multiple
        />
        {images.map((image) => (
          <div key={image.id} className="mt-4 border p-4 relative">
            <img src={image.url} alt="Uploaded" className="max-w-80" />
            <button
              onClick={() => handleRemoveImage(image.id)}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="w-1/4 p-4">
        <h2 className="text-lg font-semibold mb-4">Remove background</h2>
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
          onClick={handleRemoveBackground}
          disabled={isProcessing || images.length === 0}
          className={`bg-blue-500 text-white p-2 rounded w-full ${
            isProcessing || images.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isProcessing ? "Processing..." : "Remove background"}
        </button>
      </div>
    </div>
  );
};

export default RemoveBg;
