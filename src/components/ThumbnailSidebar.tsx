import { useState, useEffect, useCallback, useRef, memo } from "react";

interface ThumbnailSidebarProps {
  photos: string[];
  currentIndex: number;
  onPhotoSelect: (index: number) => void;
}

interface ThumbnailItemProps {
  photo: string;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

const ThumbnailItem = memo(({ photo, index, isSelected, onSelect }: ThumbnailItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==";
    setIsLoaded(true);
  }, []);

  return (
    <button
      ref={containerRef}
      onClick={() => onSelect(index)}
      className={`
        relative rounded-lg overflow-hidden transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-primary shadow-lg' 
          : 'hover:ring-1 hover:ring-border hover:bg-thumbnail-hover'
        }
        bg-thumbnail-bg
      `}
      style={{ aspectRatio: '1', height: '70px' }} // 30% smaller than default
    >
      {isInView && (
        <img
          ref={imgRef}
          src={photo}
          alt={`Thumbnail ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-thumbnail-bg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
      )}
    </button>
  );
});

export const ThumbnailSidebar = ({ photos, currentIndex, onPhotoSelect }: ThumbnailSidebarProps) => {
  const handlePhotoSelect = useCallback((index: number) => {
    onPhotoSelect(index);
  }, [onPhotoSelect]);

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
        <div className="p-2 grid grid-cols-3 gap-1">
          {photos.map((photo, index) => (
            <ThumbnailItem
              key={`${photo}-${index}`}
              photo={photo}
              index={index}
              isSelected={currentIndex === index}
              onSelect={handlePhotoSelect}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};