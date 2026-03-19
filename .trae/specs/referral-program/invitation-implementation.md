# 邀请功能实现技术方案

## 概述
本文档详细说明三种邀请方式的具体实现方案：
1. 好友扫码进入小程序，自动识别邀请码
2. 好友点击卡片进入小程序，自动识别邀请码
3. 好友通过链接注册，自动绑定邀请关系

---

## 一、邀请码存储机制

### 1.1 本地存储邀请码
在小程序启动时，将邀请码存储到本地 storage 中，确保登录后可以读取。

**存储位置**：`localStorage` 或 Taro 的 `Taro.setStorageSync`

**存储 Key**：`invite_code`

**存储时机**：
- 小程序启动（onLaunch）
- 页面加载（onLoad）
- 扫码进入
- 点击分享卡片进入

**存储有效期**：7 天（与邀请关系绑定有效期一致）

---

## 二、实现方案一：扫码进入小程序，自动识别邀请码

### 2.1 流程说明
```
1. 推广者生成邀请海报（带小程序码）
2. 好友扫码进入小程序
3. 小程序获取扫码参数（scene）
4. 解析 scene 参数中的邀请码
5. 邀请码存储到本地 storage
6. 好友注册/登录
7. 注册成功后从 storage 读取邀请码
8. 调用后端接口绑定邀请关系
9. 清除 storage 中的邀请码
```

### 2.2 小程序码生成（后端）

#### 2.2.1 生成小程序码 API
**接口地址**：`GET /api/referral/qrcode`

**请求参数**：
```typescript
{
  userId: bigint;  // 推广者用户 ID
}
```

**返回数据**：
```typescript
{
  success: boolean;
  data: {
    qrcodeUrl: string;  // 小程序码图片 URL
    inviteCode: string; // 邀请码
  };
}
```

#### 2.2.2 后端实现（Node.js）
```typescript
// server/src/modules/referral/referral.controller.ts
@Get('qrcode')
async generateQRCode(@Query('userId') userId: string) {
  const inviteCode = this.inviteService.getInviteCode(BigInt(userId));
  
  // 调用微信小程序码生成接口
  const scene = `invite=${inviteCode}`;
  const qrcodeBuffer = await this.wechatService.getUnlimitedQRCode({
    scene,
    page: 'pages/index/index',
    width: 430,
  });
  
  // 上传到 OSS/CDN
  const qrcodeUrl = await this.ossService.upload(qrcodeBuffer, `qrcodes/referral/${userId}.png`);
  
  return {
    success: true,
    data: {
      qrcodeUrl,
      inviteCode,
    },
  };
}
```

### 2.3 前端解析扫码参数

#### 2.3.1 在 app.tsx 中监听启动
```typescript
// apps/mini-client/src/app.tsx
import { useEffect } from 'react';
import Taro from '@tarojs/taro';

function App() {
  useEffect(() => {
    // 获取小程序启动参数
    const launchOptions = Taro.getLaunchOptionsSync();
    handleLaunchParams(launchOptions);
  }, []);

  // 监听小程序显示（从后台切回前台）
  Taro.onShow((options) => {
    handleLaunchParams(options);
  });

  return <>{/* ... */}</>;
}

// 处理启动参数
function handleLaunchParams(options: Taro.getLaunchOptionsSync.LaunchOptions) {
  console.log('[Referral] Launch options:', options);
  
  // 场景值：1047 表示扫描小程序码
  if (options.scene === 1047 && options.query?.scene) {
    const scene = decodeURIComponent(options.query.scene);
    parseScene(scene);
  }
  
  // 场景值：1007 表示分享卡片
  if (options.scene === 1007 && options.query?.inviteCode) {
    saveInviteCode(options.query.inviteCode);
  }
  
  // H5 场景：链接参数
  if (options.query?.inviteCode) {
    saveInviteCode(options.query.inviteCode);
  }
}

// 解析 scene 参数
function parseScene(scene: string) {
  console.log('[Referral] Parsing scene:', scene);
  
  // scene 格式：invite=ABC123
  const params = new URLSearchParams(scene);
  const inviteCode = params.get('invite');
  
  if (inviteCode) {
    saveInviteCode(inviteCode);
  }
}

// 保存邀请码到本地 storage
function saveInviteCode(inviteCode: string) {
  console.log('[Referral] Saving invite code:', inviteCode);
  Taro.setStorageSync('invite_code', inviteCode);
  
  // 设置过期时间（7天后）
  const expireAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  Taro.setStorageSync('invite_code_expire', expireAt);
}

export default App;
```

---

## 三、实现方案二：点击卡片进入小程序，自动识别邀请码

### 3.1 流程说明
```
1. 推广者点击"分享给好友"
2. 生成分享卡片（带邀请码参数）
3. 好友点击卡片进入小程序
4. 小程序获取分享参数（query）
5. 从 query 中读取邀请码
6. 邀请码存储到本地 storage
7. 好友注册/登录
8. 注册成功后从 storage 读取邀请码
9. 调用后端接口绑定邀请关系
10. 清除 storage 中的邀请码
```

### 3.2 前端分享功能实现

#### 3.2.1 在推广页面添加分享按钮
```typescript
// apps/mini-client/src/pages/referral/index.tsx
import Taro from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { useAuth } from '@/hooks/useAuth';
import { getInviteStats } from '@/services/referral';

export default function ReferralPage() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const res = await getInviteStats();
    if (res.success) {
      setInviteCode(res.data.inviteCode);
    }
  };
  
  // 分享给好友
  const onShareAppMessage = () => {
    return {
      title: '邀请你一起回收旧物，赚积分！',
      path: `/pages/index/index?inviteCode=${inviteCode}`,
      imageUrl: '/assets/images/share-referral.png', // 分享图片
    };
  };
  
  // 分享到朋友圈（微信）
  const onShareTimeline = () => {
    return {
      title: '邀请你一起回收旧物，赚积分！',
      query: `inviteCode=${inviteCode}`,
      imageUrl: '/assets/images/share-referral.png',
    };
  };
  
  return (
    <View className="referral-page">
      {/* ... 页面内容 ... */}
      
      {/* 分享按钮 */}
      <Button open-type="share">分享给好友</Button>
    </View>
  );
}
```

#### 3.2.2 配置页面分享
在页面配置文件中启用分享：
```typescript
// apps/mini-client/src/pages/referral/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '邀请好友',
  enableShareAppMessage: true,  // 启用分享给好友
  enableShareTimeline: true,     // 启用分享到朋友圈
});
```

---

## 四、实现方案三：链接注册（H5 平台），自动绑定邀请关系

### 4.1 流程说明
```
1. 推广者生成分享链接（带邀请码参数）
2. 推广者分享链接给好友
3. 好友点击链接进入 H5 页面
4. 从 URL 参数中读取邀请码
5. 邀请码存储到 localStorage
6. 好友注册/登录
7. 注册成功后从 localStorage 读取邀请码
8. 调用后端接口绑定邀请关系
9. 清除 localStorage 中的邀请码
```

### 4.2 生成分享链接

#### 4.2.1 前端生成分享链接
```typescript
// apps/mini-client/src/pages/referral/index.tsx
import { PlatformDetector } from '@/utils/platformDetector';

const generateShareLink = (inviteCode: string) => {
  const baseUrl = 'https://your-domain.com';
  const shareUrl = `${baseUrl}?inviteCode=${inviteCode}`;
  return shareUrl;
};

const copyShareLink = async () => {
  const shareLink = generateShareLink(inviteCode);
  
  if (PlatformDetector.isH5()) {
    // H5 环境
    navigator.clipboard.writeText(shareLink);
  } else {
    // 小程序环境
    Taro.setClipboardData({
      data: shareLink,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      },
    });
  }
};
```

### 4.3 H5 页面读取 URL 参数

#### 4.3.1 在 H5 入口页面读取参数
```typescript
// apps/mini-client/src/pages/index/index.tsx
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { PlatformDetector } from '@/utils/platformDetector';

export default function IndexPage() {
  useEffect(() => {
    if (PlatformDetector.isH5()) {
      // H5 环境：从 URL 读取邀请码
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('inviteCode');
      
      if (inviteCode) {
        saveInviteCode(inviteCode);
        
        // 清理 URL 参数（避免刷新重复处理）
        const url = new URL(window.location.href);
        url.searchParams.delete('inviteCode');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);
  
  return <>{/* ... */}</>;
}

// 保存邀请码（复用前面的函数）
function saveInviteCode(inviteCode: string) {
  Taro.setStorageSync('invite_code', inviteCode);
  const expireAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  Taro.setStorageSync('invite_code_expire', expireAt);
}
```

---

## 五、登录/注册时绑定邀请关系

### 5.1 登录成功后处理邀请码

#### 5.1.1 修改登录页面
```typescript
// apps/mini-client/src/pages/login/index.tsx
import { bindInvite } from '@/services/referral';

export default function Login() {
  // ... 现有代码 ...
  
  // 登录成功后的跳转处理
  const handleLoginSuccess = async (userId: bigint) => {
    // 尝试绑定邀请关系
    await tryBindInvite(userId);
    
    // ... 现有跳转逻辑 ...
  };
  
  // 尝试绑定邀请关系
  const tryBindInvite = async (userId: bigint) => {
    try {
      // 从 storage 读取邀请码
      const inviteCode = Taro.getStorageSync('invite_code');
      const expireAt = Taro.getStorageSync('invite_code_expire');
      
      if (!inviteCode) {
        console.log('[Referral] No invite code found');
        return;
      }
      
      // 检查是否过期
      if (expireAt && Date.now() > expireAt) {
        console.log('[Referral] Invite code expired');
        clearInviteCode();
        return;
      }
      
      console.log('[Referral] Binding invite:', inviteCode);
      
      // 调用后端接口绑定邀请关系
      const res = await bindInvite({ inviteCode, inviteeId: userId });
      
      if (res.success) {
        console.log('[Referral] Invite bound successfully');
        Taro.showToast({ title: '邀请绑定成功', icon: 'success' });
      } else {
        console.warn('[Referral] Failed to bind invite:', res.message);
      }
      
      // 无论成功失败，都清除邀请码
      clearInviteCode();
      
    } catch (error) {
      console.error('[Referral] Error binding invite:', error);
      // 出错时不清除邀请码，可以下次重试
    }
  };
  
  // 清除邀请码
  const clearInviteCode = () => {
    Taro.removeStorageSync('invite_code');
    Taro.removeStorageSync('invite_code_expire');
  };
  
  // ... 现有代码 ...
}
```

### 5.2 后端绑定邀请关系接口

#### 5.2.1 控制器
```typescript
// server/src/modules/points/points.controller.ts
@Post('invite/bind')
async bindInvite(@Body() dto: BindInviteDto) {
  await this.inviteService.handleInvite(dto.inviteeId, dto.inviteCode);
  return { success: true };
}
```

#### 5.2.2 DTO
```typescript
// server/src/modules/points/dto/bind-invite.dto.ts
export class BindInviteDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;

  @IsNumberString()
  @IsNotEmpty()
  inviteeId: string;
}
```

---

## 六、完整流程图

```
┌─────────────────────────────────────────────────────────┐
│                    推广者操作                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              ┌───────────────┐
              │  生成邀请码   │
              │  分享卡片/链接 │
              │  生成海报     │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  扫码   │  │ 分享卡片 │  │ H5链接  │
   └────┬────┘  └────┬────┘  └────┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ 读取邀请码    │
              │ 存储到 storage│
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  好友注册/登录 │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ 从 storage 读  │
              │ 取邀请码      │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ 调用后端接口   │
              │ 绑定邀请关系   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ 清除 storage  │
              │ 中的邀请码    │
              └───────────────┘
```

---

## 七、关键注意事项

### 7.1 邀请码有效期
- 邀请码存储到 storage 后，7 天内有效
- 超过有效期自动清除，不再尝试绑定

### 7.2 幂等性保证
- 后端 `handleInvite` 方法已经实现幂等性
- 重复调用不会重复创建邀请记录
- 重复调用不会重复发放邀请奖励积分

### 7.3 错误处理
- 绑定邀请关系失败时，不清除 storage 中的邀请码
- 下次登录时可以重试绑定
- 记录错误日志，方便排查问题

### 7.4 场景值说明
| 场景值 | 说明 |
|--------|------|
| 1007 | 分享卡片进入小程序 |
| 1011 | 分享到朋友圈 |
| 1047 | 扫描小程序码 |
| 1048 | 扫描二维码（H5） |

### 7.5 平台兼容性
- 微信小程序：支持扫码、分享卡片、分享朋友圈
- 支付宝小程序：支持分享
- H5：支持链接分享
- 各平台统一使用 storage 存储邀请码
