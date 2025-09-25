import { useState, useEffect } from "react";

interface ThumbnailSidebarProps {
  photos: string[];
  currentIndex: number;
  onPhotoSelect: (index: number) => void;
}

export const ThumbnailSidebar = ({ photos, currentIndex, onPhotoSelect }: ThumbnailSidebarProps) => {
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoadedThumbnails(new Set());
  }, [photos]);

  const handleThumbnailLoad = (index: number) => {
    setLoadedThumbnails(prev => new Set(prev.add(index)));
  };

  if (photos.length === 0) {
    return (
      <aside className="w-80 bg-sidebar-bg border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Photos</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm">No photos loaded</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-sidebar-bg border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">
          Photos ({photos.length})
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => onPhotoSelect(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden transition-all duration-200
                ${currentIndex === index 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:ring-1 hover:ring-border hover:bg-thumbnail-hover'
                }
                bg-thumbnail-bg
              `}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => handleThumbnailLoad(index)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==";
                }}
              />
              
              {/* Loading indicator */}
              {!loadedThumbnails.has(index) && (
                <div className="absolute inset-0 bg-thumbnail-bg flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Selected indicator */}
              {currentIndex === index && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};