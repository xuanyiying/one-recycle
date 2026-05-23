import { E2EUtils } from './utils';

describe('Login Page E2E', () => {
  let miniProgram: any;

  beforeAll(async () => {
    miniProgram = await E2EUtils.launch();
  }, 30000);

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  it('登录页面模式切换验证', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/login/index');
    
    // 检查初始状态 (假设默认是 quick 模式或 phone 模式，取决于环境)
    const quickBtn = await page.$('.btn-quick-login');
    const phoneForm = await page.$('.phone-login-form');
    expect(quickBtn || phoneForm).not.toBeNull();
    
    // 如果存在切换按钮，测试切换
    const switchBtn = await page.$('.btn-switch-mode');
    if (switchBtn) {
      await switchBtn.tap();
      await page.waitFor(500);
      
      // 验证模式是否改变
      const newPhoneForm = await page.$('.phone-login-form');
      expect(newPhoneForm).not.toBeNull();
    }
  });

  it('未勾选协议点击登录应报错', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/login/index');
    
    // 确保在手机号登录模式
    const switchBtn = await page.$('.btn-switch-mode');
    if (switchBtn) {
      const phoneForm = await page.$('.phone-login-form');
      if (!phoneForm) {
        await switchBtn.tap();
        await page.waitFor(500);
      }
    }

    // 输入手机号和验证码
    await E2EUtils.input(page, '.custom-input', '13800138000');
    // 注意：第二个 input 可能是验证码
    const inputs = await page.$$('.custom-input');
    if (inputs.length >= 2) {
      await inputs[1].input('123456');
    }

    // 点击登录 (此时未勾选协议)
    await E2EUtils.tap(page, '.btn-login');
    await page.waitFor(500);

    // 检查错误提示
    const errorText = await E2EUtils.getText(page, '.error-text');
    expect(errorText).toContain('协议');
  });

  it('协议勾选交互验证', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/login/index');
    
    const checkbox = await page.$('.agreement-checkbox');
    expect(checkbox).not.toBeNull();
    
    // 点击协议链接跳转
    const links = await page.$$('.agreement-link');
    if (links.length > 0) {
      await links[0].tap();
      await page.waitFor(1000);
      const currentPage = await miniProgram.currentPage();
      expect(currentPage.path).toContain('pages/agreement/index');
    }
  });
});
