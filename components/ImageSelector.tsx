'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface PexelsImage {
  id: number;
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface ImageSelectorProps {
  keywords: string;
  onImageSelect: (imageUrl: string, altText: string) => void;
  selectedImage?: string;
}

export function ImageSelector({ keywords, onImageSelect, selectedImage }: ImageSelectorProps) {
  const [images, setImages] = useState<PexelsImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    if (!keywords.trim()) return;

    setIsLoading(true);
    setError('');
    setImages([]);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });

      const data = await response.json();

      if (response.ok) {
        setImages(data.images || []);
      } else {
        setError(data.error || 'Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('An error occurred while fetching images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      onImageSelect(customUrl, keywords);
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={fetchImages}
          disabled={isLoading || !keywords.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding Images...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Get AI Suggested Images
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Hide' : 'Use'} Custom URL
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showCustom && (
        <div className="space-y-2">
          <Label>Custom Image URL</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <Button type="button" onClick={handleCustomUrl}>
              Add
            </Button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="space-y-2">
          <Label>Selected Image</Label>
          <Card className="p-2">
            <img
              src={selectedImage}
              alt="Selected petition"
              className="w-full h-48 object-cover rounded"
            />
          </Card>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Choose an Image</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card
                key={image.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedImage === image.url ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => onImageSelect(image.url, image.alt)}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover rounded-t"
                  />
                  <div className="p-2 text-xs text-gray-600">
                    Photo by{' '}
                    <a
                      href={image.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {image.photographer}
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
