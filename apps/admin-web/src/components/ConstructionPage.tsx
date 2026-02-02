'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function ConstructionPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary-50 p-4 rounded-full">
              <Construction className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            该模块正在重构中，即将上线 Tailwind CSS 版本。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
