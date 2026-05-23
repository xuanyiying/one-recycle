import automator from 'miniprogram-automator';
import path from 'path';

export class E2EUtils {
  static async launch() {
    return await automator.launch({
      projectPath: path.resolve(__dirname, '../../'),
    });
  }

  static async getPage(miniProgram: any, url: string) {
    const page = await miniProgram.reLaunch(url);
    await page.waitFor(1000);
    return page;
  }

  static async tap(page: any, selector: string) {
    const element = await page.$(selector);
    if (element) {
      await element.tap();
    } else {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  static async input(page: any, selector: string, value: string) {
    const element = await page.$(selector);
    if (element) {
      await element.input(value);
    } else {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  static async getText(page: any, selector: string) {
    const element = await page.$(selector);
    if (element) {
      return await element.text();
    }
    return null;
  }
}
