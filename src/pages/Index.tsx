import { useState, useCallback } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { ThumbnailSidebar } from "@/components/ThumbnailSidebar";
import { PhotoViewer } from "@/components/PhotoViewer";
import { toast } from "sonner";

const Index = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleUrlLoad = useCallback((url: string) => {
    // Validate if it's likely an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const isImageUrl = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    ) || url.includes('image') || url.includes('photo');

    if (!isImageUrl) {
      toast.warning("URL doesn't appear to be an image. Loading anyway...");
    }

    setPhotos([url]);
    setCurrentIndex(0);
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
        />
      </div>
    </div>
  );
};

export default Index;