'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('设置保存成功');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>系统设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="siteName" className="text-sm font-medium">站点名称</label>
            <Input id="siteName" defaultValue="One Recycle Admin" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="contactPhone" className="text-sm font-medium">联系电话</label>
            <Input id="contactPhone" defaultValue="400-123-4567" />
          </div>
          <div className="pt-4">
             <Button onClick={handleSave}>保存设置</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
