import { E2EUtils } from './utils';

describe('Index Page E2E', () => {
  let miniProgram: any;

  beforeAll(async () => {
    miniProgram = await E2EUtils.launch();
  }, 30000);

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  it('首页基本渲染验证', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/index/index');
    
    // 验证位置信息
    const cityText = await E2EUtils.getText(page, '.city-name');
    expect(cityText).toBeDefined();

    // 验证核心操作区
    const coreArea = await page.$('.core-action-area');
    expect(coreArea).not.toBeNull();
  });

  it('城市选择交互验证', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/index/index');
    await E2EUtils.tap(page, '.location-pill');
    
    // 验证是否触发了 Toast (automator 很难直接捕获 Toast 内容，但可以验证逻辑是否执行)
    // 这里我们可以通过拦截 Taro.showToast 来验证，但 automator 主要是黑盒测试
  });

  it('问答区域展开收起验证', async () => {
    const page = await E2EUtils.getPage(miniProgram, '/pages/index/index');
    
    // 找到第一个问答项
    const qaItem = await page.$('.qa-item');
    if (qaItem) {
      await qaItem.tap();
      await page.waitFor(500);
      
      // 检查是否展开（通过类名）
      const isExpanded = await qaItem.attribute('class');
      expect(isExpanded).toContain('expanded');
      
      // 再次点击收起
      await qaItem.tap();
      await page.waitFor(500);
      const isCollapsed = await qaItem.attribute('class');
      expect(isCollapsed).not.toContain('expanded');
    }
  });

  it('底部导航切换验证', async () => {
    // 假设底部有 tabbar
    // automator 可以直接调用 switchTab
    await miniProgram.switchTab('/pages/order/index');
    await miniProgram.waitFor(1000);
    const currentPage = await miniProgram.currentPage();
    expect(currentPage.path).toContain('pages/order/index');
  });
});
