'use client';

import { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SingleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  multiple?: false;
}

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  multiple: true;
}

type ImageUploadProps = SingleImageUploadProps | MultipleImageUploadProps;

function ImageUpload({ value, onChange, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setError(null);
      setUploading(true);

      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            continue;
          }

          if (file.size > 10 * 1024 * 1024) {
            setError('图片大小不能超过 10MB');
            continue;
          }

          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileType', 'IMAGE');
          formData.append('category', 'product');

          const token = localStorage.getItem('auth_token');
          const headers: HeadersInit = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers,
          });

          if (!response.ok) {
            throw new Error('上传失败');
          }

          const data = await response.json();
          const url = data.data?.url || data.url;

          if (multiple) {
            const currentUrls = (value as string[]) || [];
            (onChange as (urls: string[]) => void)([...currentUrls, url]);
          } else {
            (onChange as (url: string) => void)(url);
            if (file.type.startsWith('image/')) {
              setPreviewUrl(URL.createObjectURL(file));
            }
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('上传失败，请重试');
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [multiple, onChange, value]
  );

  const handleRemove = useCallback(
    (index?: number) => {
      if (multiple && index !== undefined) {
        const currentUrls = (value as string[]) || [];
        const newUrls = currentUrls.filter((_, i) => i !== index);
        (onChange as (urls: string[]) => void)(newUrls);
      } else {
        (onChange as (url: string) => void)('');
        setPreviewUrl(null);
      }
    },
    [multiple, onChange, value]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!multiple && !value && !previewUrl && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-gray-500">上传中...</div>
          ) : (
            <div className="text-gray-500">
              <div className="text-2xl mb-1">📷</div>
              <div>点击上传图片</div>
              <div className="text-xs mt-1">支持 JPG、PNG 格式</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-sm">{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            重试
          </Button>
        </div>
      )}

      {!multiple && (value || previewUrl) && (
        <div className="relative inline-block">
          <img
            src={previewUrl || (value as string)}
            alt="预览"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => handleRemove()}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {multiple && (
        <div className="space-y-2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <div className="text-gray-500">上传中...</div>
            ) : (
              <div className="text-gray-500 text-sm">点击添加更多图片</div>
            )}
          </div>

          {value && (value as string[]).length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {(value as string[]).map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ImageUpload };
