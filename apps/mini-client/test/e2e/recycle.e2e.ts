import { E2EUtils } from './utils';

describe('Recycle Flow E2E', () => {
  let miniProgram: any;

  beforeAll(async () => {
    miniProgram = await E2EUtils.launch();
  }, 30000);

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  it('完整回收下单流程验证', async () => {
    // 1. 进入首页并点击一个分类
    const indexPage = await E2EUtils.getPage(miniProgram, '/pages/index/index');
    await E2EUtils.tap(indexPage, '.category-tab-item'); // 点击第一个分类
    await miniProgram.waitFor(1000);

    // 2. 验证是否跳转到回收页面
    let currentPage = await miniProgram.currentPage();
    expect(currentPage.path).toContain('pages/recycle/index');

    // 3. 步骤1：填写物品信息
    const recyclePage = currentPage;
    // 假设 ItemForm 有一个“下一步”按钮
    const nextBtn1 = await recyclePage.$('.btn-next'); 
    if (nextBtn1) {
      // 模拟输入物品信息（如果需要）
      await E2EUtils.tap(recyclePage, '.btn-next');
      await miniProgram.waitFor(1000);
    }

    // 4. 步骤2：选择地址
    currentPage = await miniProgram.currentPage();
    const addressCard = await currentPage.$('.address-card');
    if (addressCard) {
      await addressCard.tap();
      await miniProgram.waitFor(500);
    }
    const nextBtn2 = await currentPage.$('.btn-next');
    if (nextBtn2) {
      await nextBtn2.tap();
      await miniProgram.waitFor(1000);
    }

    // 5. 步骤3：选择时间并提交
    currentPage = await miniProgram.currentPage();
    const timeSlot = await currentPage.$('.time-slot-item');
    if (timeSlot) {
      await timeSlot.tap();
      await miniProgram.waitFor(500);
    }
    const submitBtn = await currentPage.$('.btn-submit');
    if (submitBtn) {
      await submitBtn.tap();
      await miniProgram.waitFor(2000); // 等待提交接口返回
    }

    // 6. 验证成功页面
    currentPage = await miniProgram.currentPage();
    // 成功页面可能由 OrderCreationFlow 内部渲染，路径可能没变，或者跳转到了 success 页面
    const successView = await currentPage.$('.order-success');
    expect(successView).not.toBeNull();
  });
});
