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
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { staffService } from '@/services/staffService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserListResponse, UserRole, UserQueryParams } from '@/types/user';
import { toast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Search, Edit, Trash2, RotateCw } from 'lucide-react';
import UserModal from './components/UserModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Params
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  // Local State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserListResponse | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Sync Search Input with URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL on Search Change (Debounced)
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        username: search || undefined,
        roleCode: (role as UserRole) || undefined,
      };
      const response = await staffService.getStaffs(params);
      setData(response as any);
    } catch (error) {
      console.error(error);
      toast.error('获取员工列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUrl = (newParams: Partial<UserQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.page) params.set('page', newParams.page.toString());
    if (newParams.limit) params.set('limit', newParams.limit.toString());

    if (newParams.search !== undefined) {
      if (newParams.search) params.set('search', newParams.search);
      else params.delete('search');
    }

    if (newParams.role !== undefined) {
      if (newParams.role) params.set('role', newParams.role);
      else params.delete('role');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ role: e.target.value as UserRole, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该员工吗？此操作不可恢复。')) return;

    try {
      await staffService.deleteStaff(id);
      toast.success('删除成功');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleModalOk = async (values: any) => {
    try {
      setModalLoading(true);
      if (editingUser) {
        await staffService.updateStaff(editingUser.id, {
          ...values,
          roleCode: values.role,
        });
        toast.success('更新成功');
      } else {
        await staffService.createStaff({
          ...values,
          roleCode: values.role,
        });
        toast.success('创建成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(editingUser ? '更新失败' : '创建失败');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名/邮箱/手机..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select
                value={role}
                onChange={handleRoleChange}
                className="w-[150px]"
              >
                <option value="">所有角色</option>
                <option value={UserRole.ADMIN}>管理员</option>
                <option value={UserRole.MANAGER}>经理</option>
                <option value={UserRole.OPERATOR}>操作员</option>
                <option value={UserRole.CUSTOMER}>客户</option>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={() => fetchUsers()} title="刷新">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.username} />
                          ) : null}
                          <AvatarFallback>
                            {user.fullName?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{user.email}</span>
                        <span className="text-muted-foreground">{user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ((user.role as any)?.code || user.role) === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                        ((user.role as any)?.code || user.role) === UserRole.MANAGER ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {(user.role as any)?.name || user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                onChange={(p: number) => updateUrl({ page: p })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <UserModal
        visible={modalVisible}
        initialValues={editingUser || undefined}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        loading={modalLoading}
      />
    </div>
  );
}
