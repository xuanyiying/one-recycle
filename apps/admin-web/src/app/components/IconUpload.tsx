'use client';

import React, { useState, useEffect } from 'react';
import { Upload, message, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import categoryService from '../../services/categoryService';

const { Dragger } = Upload;

interface IconUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  disabled?: boolean;
}

const IconUpload: React.FC<IconUploadProps> = ({ value, onChange, disabled = false }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);

  // 当外部value变化时更新预览
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const uploadProps: UploadProps = {
    name: 'icon',
    multiple: false,
    accept: 'image/*',
    maxCount: 1,
    fileList,
    disabled: disabled || uploading,
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        setUploading(true);
        onProgress?.({ percent: 50 });
        
        const response = await categoryService.uploadIcon(file as File);
        
        onProgress?.({ percent: 100 });
        onSuccess?.(response);
        
        setPreviewUrl(response.url);
        onChange?.(response.url);
        message.success('图标上传成功');
      } catch (error) {
        console.error('Upload failed:', error);
        onError?.(error as Error);
        message.error('图标上传失败，请重试');
      } finally {
        setUploading(false);
        setFileList([]);
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!');
        return false;
      }
      
      return true;
    },
    onChange(info) {
      const { status } = info.file;
      
      if (status === 'uploading') {
        setFileList([info.file]);
      } else if (status === 'done' || status === 'error') {
        setFileList([]);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove() {
      setPreviewUrl(null);
      onChange?.(null);
      setFileList([]);
    },
  };

  return (
    <div>
      {previewUrl ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Image
              width={64}
              height={64}
              src={previewUrl}
              alt="图标预览"
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
            <div>
              <div>当前图标</div>
              <a 
                onClick={() => {
                  setPreviewUrl(null);
                  onChange?.(null);
                }}
                style={{ color: '#ff4d4f', cursor: 'pointer' }}
              >
                删除图标
              </a>
            </div>
          </div>
        </div>
      ) : null}
      
      <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持单个文件上传。仅支持图片格式，文件大小不超过5MB。
        </p>
      </Dragger>
    </div>
  );
};

export default IconUpload;