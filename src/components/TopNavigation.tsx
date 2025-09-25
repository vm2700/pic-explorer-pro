import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Link, Upload } from "lucide-react";
import { toast } from "sonner";

interface TopNavigationProps {
  onFolderSelect: (files: FileList) => void;
  onUrlLoad: (url: string) => void;
}

export const TopNavigation = ({ onFolderSelect, onUrlLoad }: TopNavigationProps) => {
  const [urlInput, setUrlInput] = useState("");

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFolderSelect(files);
      toast.success(`Loaded ${files.length} files`);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlLoad(urlInput.trim());
      toast.success("Loading image from URL");
    }
  };

  return (
    <nav className="bg-nav-bg border-b border-border px-6 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-foreground">Photo Viewer</div>
      </div>
      
      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        {/* Folder Selection */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            {...({ webkitdirectory: "" } as any)}
            onChange={handleFolderSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="folder-input"
          />
          <Button variant="outline" className="gap-2" asChild>
            <label htmlFor="folder-input" className="cursor-pointer">
              <Folder className="h-4 w-4" />
              Select Folder
            </label>
          </Button>
        </div>

        {/* File Selection */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFolderSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-input"
          />
          <Button variant="outline" className="gap-2" asChild>
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Select Files
            </label>
          </Button>
        </div>

        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="flex gap-2 flex-1">
          <Input
            type="url"
            placeholder="Enter image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="gap-2">
            <Link className="h-4 w-4" />
            Load URL
          </Button>
        </form>
      </div>
    </nav>
  );
};