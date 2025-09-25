import { useState, useRef, useEffect, useCallback } from "react";

interface PhotoViewerProps {
  currentPhoto: string | null;
  photos: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const PhotoViewer = ({ currentPhoto, photos, currentIndex, onNavigate }: PhotoViewerProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanX, setLastPanX] = useState(0);
  const [lastPanY, setLastPanY] = useState(0);

  // Reset zoom and pan when photo changes
  useEffect(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    setLastPanX(0);
    setLastPanY(0);
  }, [currentPhoto]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (photos.length === 0) return;
      
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onNavigate]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, scale * scaleChange));
    setScale(newScale);
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  }, [scale, panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      setPanX(newPanX);
      setPanY(newPanY);
    }
  }, [isDragging, scale, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPanX(panX);
    setLastPanY(panY);
  }, [panX, panY]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - panX, 
        y: e.touches[0].clientY - panY 
      });
    }
  }, [scale, panX, panY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const newPanX = e.touches[0].clientX - dragStart.x;
      const newPanY = e.touches[0].clientY - dragStart.y;
      setPanX(newPanX);
      setPanY(newPanY);
    }
  }, [isDragging, scale, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPanX(panX);
    setLastPanY(panY);
  }, [panX, panY]);

  const getCursorStyle = () => {
    if (scale > 1) {
      return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    }
    return 'cursor-zoom-in';
  };

  if (!currentPhoto) {
    return (
      <div className="flex-1 bg-photo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-muted-foreground">📷</div>
          <p className="text-muted-foreground text-lg">No photo selected</p>
          <p className="text-muted-foreground text-sm mt-2">
            Select a folder or enter a URL to start viewing photos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-photo-bg flex items-center justify-center p-4 relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        ref={imageRef}
        src={currentPhoto}
        alt="Photo preview"
        className={`max-w-full max-h-full object-contain transition-transform select-none ${getCursorStyle()}`}
        style={{ 
          imageRendering: "auto" as const,
          WebkitUserSelect: "none",
          userSelect: "none",
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center center'
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcgaW1hZ2U8L3RleHQ+PC9zdmc+";
        }}
        onDragStart={(e) => e.preventDefault()}
      />
      
      {/* Navigation indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          {currentIndex + 1} of {photos.length}
        </div>
      )}
      
      {/* Navigation arrows */}
      {photos.length > 1 && currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full p-3 text-white transition-colors"
        >
          ←
        </button>
      )}
      
      {photos.length > 1 && currentIndex < photos.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full p-3 text-white transition-colors"
        >
          →
        </button>
      )}
    </div>
  );
};