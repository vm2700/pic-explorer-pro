import { useState, useRef, useEffect } from "react";

interface PhotoViewerProps {
  currentPhoto: string | null;
  photos: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const PhotoViewer = ({ currentPhoto, photos, currentIndex, onNavigate }: PhotoViewerProps) => {
  const imageRef = useRef<HTMLImageElement>(null);

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
    <div className="flex-1 bg-photo-bg flex items-center justify-center p-4 relative overflow-hidden">
      <img
        ref={imageRef}
        src={currentPhoto}
        alt="Photo preview"
        className="max-w-full max-h-full object-contain cursor-zoom-in hover:cursor-zoom-out transition-transform duration-200"
        style={{ 
          imageRendering: "auto" as const,
          WebkitUserSelect: "none",
          userSelect: "none"
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcgaW1hZ2U8L3RleHQ+PC9zdmc+";
        }}
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