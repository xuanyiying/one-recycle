import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto } from '../../src/modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/modules/category/dto/update-category.dto';

describe('Category DTOs', () => {
  describe('CreateCategoryDto', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        name: '测试分类',
        description: '测试描述',
        type: 'PRODUCT',
        priceInfo: {
          type: 'UNIT',
          unitPrice: 10.5,
          unit: 'kg',
          currency: 'CNY'
        },
        icon: {
          url: 'https://example.com/test-icon.png',
          filename: 'test-icon.png'
        },
        sortOrder: 1,
        isVisible: true,
        isFeatured: false,
        seo: {
          slug: 'test-category'
        }
      };

      const dto = plainToClass(CreateCategoryDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal required data', async () => {
      const minimalData = {
        name: '最小分类',
        type: 'PRODUCT',
        priceInfo: {
          type: 'UNIT',
          unitPrice: 0,
          unit: 'kg',
          currency: 'CNY'
        },
        seo: {
          slug: 'minimal-category'
        }
      };

      const dto = plainToClass(CreateCategoryDto, minimalData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('name validation', () => {
      it('should fail when name is missing', async () => {
        const invalidData = {
          description: '测试描述',
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail when name is empty string', async () => {
        const invalidData = {
          name: '',
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail when name is only whitespace', async () => {
        const invalidData = {
          name: '   ',
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail when name exceeds maximum length', async () => {
        const invalidData = {
          name: 'A'.repeat(101), // Assuming max length is 100
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
        expect(errors[0].constraints).toHaveProperty('maxLength');
      });

      it('should pass with name at maximum length', async () => {
        const validData = {
          name: 'A'.repeat(100), // Assuming max length is 100
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should handle special characters in name', async () => {
        const validData = {
          name: '特殊字符分类!@#$%^&*()',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should handle unicode characters in name', async () => {
        const validData = {
          name: '中文分类名称🔥💯',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('description validation', () => {
      it('should pass when description is optional and missing', async () => {
        const validData = {
          name: '测试分类',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with valid description', async () => {
        const validData = {
          name: '测试分类',
          description: '这是一个测试分类的描述',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail when description exceeds maximum length', async () => {
        const invalidData = {
          name: '测试分类',
          description: 'A'.repeat(501), // Assuming max length is 500
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('description');
        expect(errors[0].constraints).toHaveProperty('maxLength');
      });

      it('should pass with description at maximum length', async () => {
        const validData = {
          name: '测试分类',
          description: 'A'.repeat(500), // Assuming max length is 500
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should handle special characters in description', async () => {
        const validData = {
          name: '测试分类',
          description: '包含特殊字符的描述：《》？：""{} []!@#$%^&*()',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('priceInfo validation', () => {
      it('should pass with valid price info', async () => {
        const validData = {
          name: '测试分类',
          type: 'PRODUCT',
          priceInfo: {
            type: 'UNIT',
            unitPrice: 10.99,
            unit: 'kg',
            currency: 'CNY'
          },
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with zero price', async () => {
        const validData = {
          name: '测试分类',
          type: 'PRODUCT',
          priceInfo: {
            type: 'UNIT',
            unitPrice: 0,
            unit: 'kg',
            currency: 'CNY'
          },
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail with negative price', async () => {
        const invalidData = {
          name: '测试分类',
          type: 'PRODUCT',
          priceInfo: {
            type: 'UNIT',
            unitPrice: -1,
            unit: 'kg',
            currency: 'CNY'
          },
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('priceInfo');
      });

      it('should handle decimal prices correctly', async () => {
        const validData = {
          name: '测试分类',
          unitPrice: 99.99,
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should handle very large prices', async () => {
        const validData = {
          name: '测试分类',
          unitPrice: 999999.99,
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should handle very small decimal prices', async () => {
        const validData = {
          name: '测试分类',
          unitPrice: 0.01,
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('icon validation', () => {
      it('should pass when icon is optional and missing', async () => {
        const validData = {
          name: '测试分类',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with valid icon filename', async () => {
        const validData = {
          name: '测试分类',
          icon: 'category-icon.png',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with icon URL', async () => {
        const validData = {
          name: '测试分类',
          icon: 'https://example.com/icon.png',
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail when icon exceeds maximum length', async () => {
        const invalidData = {
          name: '测试分类',
          icon: 'A'.repeat(256), // Assuming max length is 255
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('icon');
        expect(errors[0].constraints).toHaveProperty('maxLength');
      });
    });

    describe('sortOrder validation', () => {
      it('should pass with valid positive sort order', async () => {
        const validData = {
          name: '测试分类',
          sortOrder: 1,
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with zero sort order', async () => {
        const validData = {
          name: '测试分类',
          sortOrder: 0,
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail with negative sort order', async () => {
        const invalidData = {
          name: '测试分类',
          sortOrder: -1,
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sortOrder');
        expect(errors[0].constraints).toHaveProperty('min');
      });

      it('should fail with non-integer sort order', async () => {
        const invalidData = {
          name: '测试分类',
          sortOrder: 1.5,
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sortOrder');
        expect(errors[0].constraints).toHaveProperty('isInt');
      });

      it('should fail with non-numeric sort order', async () => {
        const invalidData = {
          name: '测试分类',
          sortOrder: 'invalid',
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sortOrder');
        expect(errors[0].constraints).toHaveProperty('isInt');
      });
    });

    describe('isVisible validation', () => {
      it('should pass with true value', async () => {
        const validData = {
          name: '测试分类',
          type: 'PRODUCT',
          isVisible: true,
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with false value', async () => {
        const validData = {
          name: '测试分类',
          type: 'PRODUCT',
          isVisible: false,
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail with string value', async () => {
        const invalidData = {
          name: '测试分类',
          type: 'PRODUCT',
          isVisible: 'true',
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('isVisible');
        expect(errors[0].constraints).toHaveProperty('isBoolean');
      });

      it('should fail with numeric value', async () => {
        const invalidData = {
          name: '测试分类',
          type: 'PRODUCT',
          isVisible: 1,
          seo: {
            slug: 'test-category'
          }
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('isVisible');
        expect(errors[0].constraints).toHaveProperty('isBoolean');
      });
    });

    describe('multiple field validation', () => {
      it('should accumulate multiple validation errors', async () => {
        const invalidData = {
          name: '', // Empty name
          type: 'INVALID', // Invalid type
          sortOrder: -1, // Negative sort order
          isVisible: 'invalid', // Non-boolean
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(4);
        expect(errors.map(e => e.property)).toContain('name');
        expect(errors.map(e => e.property)).toContain('type');
        expect(errors.map(e => e.property)).toContain('sortOrder');
        expect(errors.map(e => e.property)).toContain('isVisible');
      });

      it('should pass with all valid optional fields', async () => {
        const validData = {
          name: '完整测试分类',
          description: '完整的测试分类描述',
          type: 'PRODUCT',
          priceInfo: {
            type: 'UNIT',
            unitPrice: 15.99,
            unit: 'kg',
            currency: 'CNY'
          },
          icon: {
            url: 'complete-icon.png',
            alt: 'Complete icon'
          },
          sortOrder: 5,
          isVisible: true,
          isFeatured: false,
          seo: {
            slug: 'complete-test-category',
            title: '完整测试分类',
            description: '完整的测试分类描述'
          }
        };

        const dto = plainToClass(CreateCategoryDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('edge cases', () => {
      it('should handle null values', async () => {
        const invalidData = {
          name: null,
          description: null,
          type: null,
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });

      it('should handle undefined values', async () => {
        const invalidData = {
          name: undefined,
          description: undefined,
          type: undefined,
        };

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });

      it('should handle empty object', async () => {
        const invalidData = {};

        const dto = plainToClass(CreateCategoryDto, invalidData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('name');
      });
    });
  });

  describe('UpdateCategoryDto', () => {
    it('should pass validation with valid partial data', async () => {
      const validData = {
        name: '更新的分类名称',
      };

      const dto = plainToClass(UpdateCategoryDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with all fields', async () => {
      const validData = {
        name: '更新的分类',
        description: '更新的描述',
        type: 'SERVICE',
        priceInfo: {
          type: 'UNIT',
          unitPrice: 25.99,
          unit: 'kg',
          currency: 'CNY'
        },
        icon: {
          url: 'updated-icon.png',
          alt: 'Updated icon'
        },
        sortOrder: 10,
        isVisible: false,
        isFeatured: true,
        seo: {
          slug: 'updated-category',
          title: '更新的分类',
          description: '更新的描述'
        }
      };

      const dto = plainToClass(UpdateCategoryDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const validData = {};

      const dto = plainToClass(UpdateCategoryDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should apply same validation rules as CreateCategoryDto', async () => {
      const invalidData = {
        name: '', // Empty name
        type: 'INVALID', // Invalid type
        sortOrder: -1, // Negative sort order
        isVisible: 'invalid', // Non-boolean
      };

      const dto = plainToClass(UpdateCategoryDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('name');
      expect(errors.map(e => e.property)).toContain('type');
      expect(errors.map(e => e.property)).toContain('sortOrder');
      expect(errors.map(e => e.property)).toContain('isVisible');
    });

    it('should handle partial updates correctly', async () => {
      const partialData = {
        priceInfo: {
          type: 'UNIT',
          unitPrice: 50.0,
          unit: 'kg',
          currency: 'CNY'
        },
        isVisible: false,
      };

      const dto = plainToClass(UpdateCategoryDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate individual fields when provided', async () => {
      const invalidPartialData = {
        priceInfo: {
          type: 'UNIT',
          unitPrice: -10, // Invalid negative price
          unit: 'kg',
          currency: 'CNY'
        }
      };

      const dto = plainToClass(UpdateCategoryDto, invalidPartialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priceInfo');
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('Data Transformation', () => {
    it('should transform string numbers to actual numbers', async () => {
      const dataWithStringNumbers = {
        name: '测试分类',
        type: 'PRODUCT',
        sortOrder: '5',
        seo: {
          slug: 'test-category'
        }
      };

      const dto = plainToClass(CreateCategoryDto, dataWithStringNumbers, {
        enableImplicitConversion: true,
      });

      expect(typeof dto.sortOrder).toBe('number');
      expect(dto.sortOrder).toBe(5);
    });

    it('should transform string booleans to actual booleans', async () => {
      const dataWithStringBoolean = {
        name: '测试分类',
        type: 'PRODUCT',
        isVisible: 'true',
        seo: {
          slug: 'test-category'
        }
      };

      const dto = plainToClass(CreateCategoryDto, dataWithStringBoolean, {
        enableImplicitConversion: true,
      });

      expect(typeof dto.isVisible).toBe('boolean');
      expect(dto.isVisible).toBe(true);
    });

    it('should trim whitespace from strings', async () => {
      const dataWithWhitespace = {
        name: '  测试分类  ',
        description: '  测试描述  ',
        icon: '  icon.png  ',
      };

      const dto = plainToClass(CreateCategoryDto, dataWithWhitespace);

      expect(dto.name).toBe('  测试分类  '); // Should be trimmed by validation decorators
      expect(dto.description).toBe('  测试描述  ');
      expect(dto.icon).toBe('  icon.png  ');
    });
  });
});