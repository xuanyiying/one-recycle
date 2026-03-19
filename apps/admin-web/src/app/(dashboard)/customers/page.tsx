'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, RotateCw, Eye } from 'lucide-react';
import { customerUserService, CustomerUser } from '@/services/customerUserService';

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const mobile = searchParams.get('mobile') || '';
  const nickname = searchParams.get('nickname') || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    items: CustomerUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [searchMobile, setSearchMobile] = useState(mobile);
  const [searchNickname, setSearchNickname] = useState(nickname);
  const debouncedMobile = useDebounce(searchMobile, 500);
  const debouncedNickname = useDebounce(searchNickname, 500);

  useEffect(() => {
    setSearchMobile(mobile);
    setSearchNickname(nickname);
  }, [mobile, nickname]);

  useEffect(() => {
    if (debouncedMobile !== mobile || debouncedNickname !== nickname) {
      updateUrl({ mobile: debouncedMobile, nickname: debouncedNickname, page: '1' });
    }
  }, [debouncedMobile, debouncedNickname]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerUserService.getCustomers({
        page,
        limit,
        mobile: debouncedMobile || undefined,
        nickname: debouncedNickname || undefined,
      });
      setData(response);
    } catch (error) {
      console.error(error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedMobile, debouncedNickname]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (newParams.page === undefined && !params.has('page')) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleViewDetail = (user: CustomerUser) => {
    router.push(`/customers/${user.id}`);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      DELETED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: '正常',
      SUSPENDED: '禁用',
      DELETED: '已删除',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">C端用户管理</h1>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2 gap-4">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索手机号..."
                  className="pl-9"
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value)}
                />
              </div>
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索昵称..."
                  className="pl-9"
                  value={searchNickname}
                  onChange={(e) => setSearchNickname(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchCustomers} title="刷新">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户信息</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>积分</TableHead>
                <TableHead>订单数</TableHead>
                <TableHead>累计金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-8 w-[120px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-[100px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-[60px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-[60px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-[80px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-[50px] bg-muted rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-[100px] bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-[60px] bg-muted rounded ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(user)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {user.nickname?.charAt(0) || user.mobile?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.nickname || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.mobile || '-'}</TableCell>
                    <TableCell>{user.points}</TableCell>
                    <TableCell>{user.orderCount}</TableCell>
                    <TableCell>¥{user.totalOrderAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(user)} title="查看详情">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && (
            <div className="border-t px-4 py-4">
              <Pagination
                total={data.total}
                pageSize={limit}
                current={data.page}
                onChange={(p: number) => updateUrl({ page: p.toString() })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
