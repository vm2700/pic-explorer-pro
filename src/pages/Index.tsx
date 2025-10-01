import { useState, useCallback } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { ThumbnailSidebar } from "@/components/ThumbnailSidebar";
import { PhotoViewer } from "@/components/PhotoViewer";
import { toast } from "sonner";

const Index = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFolderSelect = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast.error("No image files found in the selected folder");
      return;
    }

    const photoUrls = imageFiles.map(file => URL.createObjectURL(file));
    setPhotos(photoUrls);
    setCurrentIndex(0);
  }, []);

  const handleUrlLoad = useCallback(async (url: string) => {
    setIsLoading(true);
    
    try {
      // Check if it's a direct image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const isDirectImage = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
      
      if (isDirectImage) {
        setPhotos([url]);
        setCurrentIndex(0);
        setIsLoading(false);
        return;
      }

      // Try to fetch and parse the directory URL for image links
      toast.info("Fetching directory contents...");
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract image URLs from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a[href]'));
      
      const imageUrls = links
        .map(link => {
          const href = link.getAttribute('href');
          if (!href) return null;
          
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(href, url).href;
          
          // Check if it's an image
          return imageExtensions.some(ext => absoluteUrl.toLowerCase().endsWith(ext)) 
            ? absoluteUrl 
            : null;
        })
        .filter((url): url is string => url !== null);

      if (imageUrls.length === 0) {
        toast.error("No images found in the directory");
        setPhotos([url]); // Fallback to loading the URL as a single image
      } else {
        setPhotos(imageUrls);
        toast.success(`Found ${imageUrls.length} images`);
      }
      
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading URL:', error);
      toast.error("Failed to load directory. Trying as single image...");
      setPhotos([url]);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePhotoSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const currentPhoto = photos[currentIndex] || null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopNavigation 
        onFolderSelect={handleFolderSelect}
        onUrlLoad={handleUrlLoad}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ThumbnailSidebar 
          photos={photos}
          currentIndex={currentIndex}
          onPhotoSelect={handlePhotoSelect}
        />
        
        <PhotoViewer 
          currentPhoto={currentPhoto}
          photos={photos}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;