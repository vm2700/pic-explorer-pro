import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";

interface ThumbnailSidebarProps {
  photos: string[];
  currentIndex: number;
  onPhotoSelect: (index: number) => void;
}

interface VirtualThumbnailItemProps {
  photo: string;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  style: React.CSSProperties;
}

const VirtualThumbnailItem = memo(({ photo, index, isSelected, onSelect, style }: VirtualThumbnailItemProps) => {
  const [thumbnail, setThumbnail] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate optimized thumbnail
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Super small thumbnail for performance
          const size = 48;
          canvas.width = size;
          canvas.height = size;

          // Draw scaled down image
          ctx.drawImage(img, 0, 0, size, size);
          
          // Convert to low quality JPEG for minimal memory
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6);
          setThumbnail(thumbnailUrl);
          setIsLoaded(true);
        };

        img.onerror = () => {
          setThumbnail("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=");
          setIsLoaded(true);
        };

        img.src = photo;
      } catch (error) {
        setThumbnail("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=");
        setIsLoaded(true);
      }
    };

    generateThumbnail();
  }, [photo]);

  return (
    <div style={style} className="p-1">
      <button
        onClick={() => onSelect(index)}
        className={`
          relative rounded-md overflow-hidden transition-transform duration-150
          w-full h-full
          ${isSelected 
            ? 'ring-1 ring-primary shadow-md scale-105' 
            : 'hover:scale-102 hover:ring-1 hover:ring-border'
          }
          bg-thumbnail-bg
        `}
      >
        {isLoaded && thumbnail && (
          <img
            src={thumbnail}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
        
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-thumbnail-bg flex items-center justify-center">
            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></div>
        )}
      </button>
    </div>
  );
});

VirtualThumbnailItem.displayName = "VirtualThumbnailItem";

export const ThumbnailSidebar = ({ photos, currentIndex, onPhotoSelect }: ThumbnailSidebarProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handlePhotoSelect = useCallback((index: number) => {
    onPhotoSelect(index);
  }, [onPhotoSelect]);

  // Virtual scrolling calculations
  const itemHeight = 52; // 48px + 4px padding
  const itemsPerRow = 3;
  const rowHeight = itemHeight;
  const containerHeight = containerRef.current?.clientHeight || 400;
  const visibleRows = Math.ceil(containerHeight / rowHeight) + 2; // Buffer rows
  const totalRows = Math.ceil(photos.length / itemsPerRow);
  
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const endRow = Math.min(totalRows, startRow + visibleRows);
  
  const visibleItems = useMemo(() => {
    const items = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < photos.length) {
          items.push({
            index,
            photo: photos[index],
            style: {
              position: 'absolute' as const,
              top: row * rowHeight,
              left: `${(col * 100) / itemsPerRow}%`,
              width: `${100 / itemsPerRow}%`,
              height: itemHeight,
            }
          });
        }
      }
    }
    return items;
  }, [photos, startRow, endRow, itemsPerRow, rowHeight, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

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
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div 
          className="relative p-2"
          style={{ height: totalRows * rowHeight }}
        >
          {visibleItems.map(({ index, photo, style }) => (
            <VirtualThumbnailItem
              key={`${photo}-${index}`}
              photo={photo}
              index={index}
              isSelected={currentIndex === index}
              onSelect={handlePhotoSelect}
              style={style}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};