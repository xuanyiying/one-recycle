# NestJS 控制器代码生成规则

## 控制器方法签名规则

所有控制器方法必须遵循以下规则：

1. **使用 async/await**：所有控制器方法都应该是异步的
2. **返回类型**：所有方法必须明确指定返回类型为 `Promise<any>` 或具体类型
3. **装饰器使用**：正确使用 NestJS 装饰器（@Get, @Post, @Put, @Patch, @Delete）

## 正确的控制器方法示例

```typescript
@Get()
async findAll(): Promise<any> {
    return this.service.findAll();
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
}

@Post()
async create(@Body() createDto: CreateDto): Promise<any> {
    return this.service.create(createDto);
}

@Patch(':id')
async update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<any> {
    return this.service.update(id, updateDto);
}

@Delete(':id')
async remove(@Param('id') id: string): Promise<any> {
    return this.service.remove(id);
}
```

## TypeScript 编译器配置

确保 tsconfig.json 包含以下配置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "strictFunctionTypes": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "skipLibCheck": true
  }
}
```

## 解决装饰器签名问题的方法

如果遇到 "无法解析方法修饰器的签名" 错误，请检查：

1. 确保使用了正确的 TypeScript 配置
2. 确保所有控制器方法都使用 `async` 关键字
3. 确保所有方法都有明确的返回类型
4. 重新编译项目以刷新 TypeScript 语言服务