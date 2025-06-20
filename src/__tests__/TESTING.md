# Tests Directory Structure / 测试目录结构

```
src/__tests__/
├── unit/                 # 单元测试 / Unit Tests
│   ├── utils/            # 工具函数测试 / Utility function tests
│   └── config/           # 配置文件测试 / Configuration file tests
├── components/           # 组件测试 / Component Tests
├── integration/          # 集成测试 / Integration Tests
└── setup/                # 测试设置文件 / Test setup files
```

## Test Categories / 测试分类

### Unit Tests / 单元测试
- `unit/utils/`: 测试独立工具函数 / Tests for standalone utility functions
- `unit/config/`: 测试配置文件 / Tests for configuration files

### Component Tests / 组件测试
- `components/`: 测试React组件 / Tests for React components

### Integration Tests / 集成测试
- `integration/`: 测试组件间交互 / Tests for interactions between components

### Setup / 设置
- `setup/`: 测试环境配置和全局设置 / Test environment configuration and global settings 