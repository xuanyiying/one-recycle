# Standard Service Template

This is a standardized template for all microservices in the One Recycle platform, following NestJS best practices and ensuring consistency across all services.

## Structure

```
src/
├── modules/
│   ├── [module-name]/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   └── [module-name].module.ts
├── common/
│   ├── filters/
│   ├── interceptors/
│   ├── guards/
│   └── exceptions/
├── config/
├── prisma/
├── proto/
└── main.ts
```

## Configuration Files

### tsconfig.json
Standard TypeScript configuration with strict mode enabled for better code quality.

### nest-cli.json
Standard NestJS CLI configuration for building and asset management.

### package.json
Standard scripts and dependencies for building, testing, and running the service.

## Directory Descriptions

### src/modules/
Contains business modules, each with controllers, services, DTOs, entities, interfaces, and module definition files.

### src/common/
Contains reusable components such as filters, interceptors, guards, and exception handlers.

### src/config/
Configuration management files.

### src/prisma/
Database-related files including Prisma service, module, and schema files.

### src/proto/
Protocol buffer definition files for gRPC services.

## Best Practices Implemented

1. Strict TypeScript configuration
2. Consistent directory structure
3. Multi-stage Dockerfile for optimized production builds
4. Proper error handling and logging
5. Standardized testing setup
6. Environment-based configuration
7. gRPC service definitions with Protocol Buffers
8. Database management with Prisma ORM