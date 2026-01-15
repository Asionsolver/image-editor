"use client";

import React, { useState, useRef } from "react";
import ImageEditor from "@/components/ImageEditor";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  Download,
  RefreshCw,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResultSrc(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        setResultSrc(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleEditorSave = (croppedImage: string) => {
    setResultSrc(croppedImage);
    setImageSrc(null); // Hide editor
  };

  const handleDownload = () => {
    if (resultSrc) {
      const link = document.createElement("a");
      link.href = resultSrc;
      link.download = "profile-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setImageSrc(null);
    setResultSrc(null);
  };

  return (
    <main className="min-h-screen  flex flex-col font-sans text-gray-900">
      {/* Header */}

      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Image Editor</h1>
            <Button onClick={() => setModalOpen(true)}>Upload Image</Button>
          </div>
        </div>
      </header>
      {modalOpen && (
        <div className="flex-1 flex flex-col justify-center items-center">
          {!imageSrc && !resultSrc && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upload Profile Photo
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose an image file to upload. Drag and drop or click to
                      browse.
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleModalClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">
                      Choose an image to upload
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-gray-400 text-xs">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-start">
                  <Button
                    variant="outline"
                    className="text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    onClick={handleModalClose}
                  >
                    Close
                  </Button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {imageSrc && (
          <ImageEditor
            imageSrc={imageSrc}
            onCancel={() => setImageSrc(null)}
            onSave={handleEditorSave}
          />
        )}

        {resultSrc && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Your New Profile Pic!
              </h2>

              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-8 ring-4 ring-indigo-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultSrc}
                  alt="Result"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex space-x-4 w-full justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResultSrc(null);
                    // If we stored original imageSrc logic properly we could revert to edit mode.
                    // For now, new upload.
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Image
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
