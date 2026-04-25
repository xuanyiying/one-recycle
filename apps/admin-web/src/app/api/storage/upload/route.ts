import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://backbuy.cn/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 获取认证 token
    const authHeader = request.headers.get('authorization');

    // 转发到后端服务器
    const response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '上传失败' }));
      return NextResponse.json(
        { success: false, message: errorData.message || '上传失败' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { success: false, message: '上传服务暂时不可用' },
      { status: 500 }
    );
  }
}
