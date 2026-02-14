import React from 'react';
import * as rtl from '@testing-library/react';
import CategoriesPage from '@/app/(dashboard)/categories/page';

const { render, screen, fireEvent, waitFor } = rtl as any;

jest.mock('@/services/categoryService', () => ({
  categoryService: {
    getCategoryTree: jest.fn().mockResolvedValue([]),
    deleteCategory: jest.fn().mockResolvedValue(undefined),
  },
  CategoryType: {
    RECYCLE: 'recycle',
    SALE: 'sale',
    BOTH: 'both',
  },
  CategoryStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },
  PriceType: {
    FIXED: 'fixed',
    RANGE: 'range',
    NEGOTIABLE: 'negotiable',
  },
}));

describe('CategoriesPage', () => {
  it('switches to formula pricing controls', async () => {
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('分类列表')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('公式定价'));
    expect(screen.getByText('折扣系数')).toBeInTheDocument();
  });

  it('adds tier rows for billing strategy', async () => {
    render(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('计费策略')).toBeInTheDocument();
    });

    const beforeCount = screen.getAllByPlaceholderText('1.8').length;
    fireEvent.click(screen.getByText('新增阶梯'));
    const afterCount = screen.getAllByPlaceholderText('1.8').length;
    expect(afterCount).toBe(beforeCount + 1);
  });
});
