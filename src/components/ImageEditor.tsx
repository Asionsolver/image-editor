"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";
import { getCroppedImg, getFlippedImage } from "@/utils/canvasUtils";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical,
  Undo2,
  Check,
  X,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
}

const ASPECT_RATIOS = [
  { label: "Original", value: 0, icon: ImageIcon },
  { label: "1:1", value: 1 / 1, icon: ImageIcon },
  { label: "4:3", value: 4 / 3, icon: Smartphone },
  { label: "16:9", value: 16 / 9, icon: Monitor },
];

export default function ImageEditor({
  imageSrc,
  onCancel,
  onSave,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [selectedRatio, setSelectedRatio] = useState<number>(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(
    undefined,
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSmallImage, setIsSmallImage] = useState(false);
  const [showDragInstruction, setShowDragInstruction] = useState(false);
  const isInitialized = useRef(false);

  // We use a preview image that is flipped according to state,
  // because react-easy-crop doesn't support flip natively.
  const [previewImage, setPreviewImage] = useState<string>(imageSrc);

  useEffect(() => {
    // Generate flipped preview
    const updatePreview = async () => {
      if (flip.horizontal || flip.vertical) {
        try {
          const flipped = await getFlippedImage(imageSrc, flip);
          setPreviewImage(flipped);
        } catch (e) {
          console.error("Failed to flip image", e);
        }
      } else {
        setPreviewImage(imageSrc);
      }
    };
    updatePreview();
  }, [imageSrc, flip]);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  useEffect(() => {
    if (showDragInstruction) {
      const timer = setTimeout(() => {
        setShowDragInstruction(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showDragInstruction]);

  const onMediaLoaded = (mediaSize: {
    naturalWidth: number;
    naturalHeight: number;
  }) => {
    const ratio = mediaSize.naturalWidth / mediaSize.naturalHeight;
    setOriginalAspect(ratio);
    if (!isInitialized.current) {
      setAspect(ratio);

      const isSmall =
        mediaSize.naturalWidth < 300 || mediaSize.naturalHeight < 300;
      setIsSmallImage(isSmall);
      if (isSmall) {
        setZoom(2);
      } else {
        setShowDragInstruction(true);
      }

      isInitialized.current = true;
    }
  };

  const handleAspectChange = (value: number) => {
    if (value === 0 && originalAspect) {
      setAspect(originalAspect);
    } else {
      setAspect(value);
    }
    setSelectedRatio(value);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsSaving(true);
      // We pass the previewImage (which is already flipped)
      // so we don't need to pass flip to getCroppedImg
      const croppedImage = await getCroppedImg(
        previewImage,
        croppedAreaPixels,
        rotation,
      );
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col h-screen bg-white md:flex-row overflow-hidden gap-5 ">
        {/* Editor Area */}
        <div className="relative w-full overflow-hidden order-1 md:order-1">
          {isSmallImage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-4">
              Image size is too small for proper editing.
            </div>
          )}
          <Cropper
            image={previewImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onInteractionStart={() => setShowDragInstruction(false)}
            onMediaLoaded={onMediaLoaded}
            showGrid={false}
            cropShape="round"
            zoomSpeed={0.1}
            style={{
              containerStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
          {showDragInstruction && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                This image is draggable. Drag to reposition.
              </div>
            </div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="w-full md:w-80  border-t md:border-t-0 md:border-l border-gray-200 flex flex-col order-2 md:order-2 z-20 shadow-xl rounded-[24px] p-4">
          <div className="p-4 flex items-center justify-between bg-red-50">
            {true && (
              <div className="w-full flex items-center justify-between">
                <button>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </button>
                <button className="text-[14px] font-medium">Apply</button>
              </div>
            )}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
                setFlip({ horizontal: false, vertical: false });
                setAspect(originalAspect || 1);
              }}
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Reset
            </Button> */}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Aspect Ratio */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Dimension
              </span>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    onClick={() => handleAspectChange(ratio.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all",
                      selectedRatio === ratio.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600",
                    )}
                  >
                    {ratio.icon ? (
                      <ratio.icon className="w-4 h-4 mb-1" />
                    ) : (
                      <div className="w-4 h-4 mb-1 border-2 border-dashed border-current rounded-sm" />
                    )}
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Zoom
              </span>
              <div className="flex items-center space-x-2">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.01}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="transition-all duration-75 ease-out"
                />
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Rotation
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotation((prev) => prev - 90)}
                  title="Rotate Left 90"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Slider
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotation((prev) => prev + 90)}
                  title="Rotate Right 90"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Flip */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Flip
              </span>
              <div className="flex space-x-2">
                <Button
                  variant={flip.horizontal ? "primary" : "outline"}
                  className="flex-1"
                  onClick={() =>
                    setFlip((prev) => ({
                      ...prev,
                      horizontal: !prev.horizontal,
                    }))
                  }
                >
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Flip H
                </Button>
                <Button
                  variant={flip.vertical ? "primary" : "outline"}
                  className="flex-1"
                  onClick={() =>
                    setFlip((prev) => ({ ...prev, vertical: !prev.vertical }))
                  }
                >
                  <FlipVertical className="w-4 h-4 mr-2" />
                  Flip V
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Done
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
