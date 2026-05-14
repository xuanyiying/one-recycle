'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { pointsTaskApi } from '@/services/pointsService';

interface Task {
  id: bigint;
  name: string;
  description: string | null;
  type: string;
  points: number;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export default function PointsTasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM',
    points: 0,
    icon: '',
    sortOrder: 0,
    isActive: true,
    config: '{}',
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pointsTaskApi.getTasks();
      setTasks(response || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      type: 'CUSTOM',
      points: 0,
      icon: '',
      sortOrder: 0,
      isActive: true,
      config: '{}',
    });
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      type: task.type,
      points: task.points,
      icon: task.icon || '',
      sortOrder: task.sortOrder,
      isActive: task.isActive,
      config: task.config ? JSON.stringify(task.config) : '{}',
    });
    setModalOpen(true);
  };

  const handleUpdateStatus = async (task: Task) => {
    try {
      await pointsTaskApi.updateTask(Number(task.id), { isActive: !task.isActive });
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('操作失败，请重试');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.points < 1) {
      alert('请填写完整信息');
      return;
    }

    try {
      let configData = {};
      try {
        configData = JSON.parse(formData.config);
      } catch {
        alert('扩展配置必须是有效的 JSON 格式');
        return;
      }

      const data = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        points: formData.points,
        icon: formData.icon,
        config: configData,
        sortOrder: formData.sortOrder,
      };

      if (editingTask) {
        await pointsTaskApi.updateTask(Number(editingTask.id), {
          ...data,
          isActive: formData.isActive,
        });
      } else {
        await pointsTaskApi.createTask(data);
      }

      setModalOpen(false);
      await fetchTasks();
      alert(editingTask ? '更新成功' : '创建成功');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('操作失败，请重试');
    }
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'PROFILE_COMPLETE': '完善资料',
      'FIRST_ORDER': '首单',
      'REVIEW': '评价',
      'SHARE': '分享',
      'SIGN_IN': '签到',
      'CUSTOM': '自定义',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">任务管理</h2>
          <Button onClick={handleCreate}>新增任务</Button>
        </div>
      </Card>

      {/* 任务列表 */}
      <Card>
        <Table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>任务类型</th>
              <th>奖励积分</th>
              <th>图标</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  暂无任务
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id.toString()}>
                  <td>
                    <div className="flex items-center gap-2">
                      {task.icon && (
                        <Image
                          src={task.icon}
                          alt={task.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-xs text-gray-500">{task.description || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {getTypeText(task.type)}
                    </span>
                  </td>
                  <td className="text-red-500 font-medium">{task.points}</td>
                  <td>
                    {task.icon ? (
                      <Image src={task.icon} alt="" width={24} height={24} className="w-6 h-6 rounded" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>{task.sortOrder}</td>
                  <td>
                    <Switch
                      checked={task.isActive}
                      onChange={() => handleUpdateStatus(task)}
                    />
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      编辑
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingTask ? '编辑任务' : '新增任务'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              确定
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">任务名称 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入任务名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">任务描述</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入任务描述"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">任务类型</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="PROFILE_COMPLETE">完善资料</option>
                <option value="FIRST_ORDER">首单</option>
                <option value="REVIEW">评价</option>
                <option value="SHARE">分享</option>
                <option value="SIGN_IN">签到</option>
                <option value="CUSTOM">自定义</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">奖励积分 *</label>
              <Input
                type="number"
                min={1}
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">图标 URL</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="请输入图标 URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">排序</label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">扩展配置 (JSON)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
              placeholder='例如：{"target": 10}'
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              启用状态
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
