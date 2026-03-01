import { Injectable, Logger } from '@nestjs/common';
import { VoiceOrderService } from '../services/voice-order.service';
import { DialogTemplateService } from '../services/dialog-template.service';
import { IntentEngine } from './intent.engine';
import {
  DialogFlowResult,
  VoiceOrderIntent,
  DialogContext,
  DialogAction,
} from '../interfaces/voice-order.interface';
import {
  DialogStep,
  CollectedDataDto,
} from '../dto/voice-input.dto';

@Injectable()
export class DialogFlowEngine {
  private readonly logger = new Logger(DialogFlowEngine.name);

  constructor(
    private readonly intentEngine: IntentEngine,
    private readonly voiceOrderService: VoiceOrderService,
    private readonly dialogTemplateService: DialogTemplateService,
  ) { }

  /**
   * 处理用户输入
   */
  async processInput(
    sessionId: string,
    userId: string,
    recognizedText: string,
  ): Promise<DialogFlowResult> {
    // 1. 获取当前对话状态
    const session = await this.voiceOrderService.getSession(sessionId);

    // 2. 意图识别
    const intentResult = await this.intentEngine.recognize(
      recognizedText,
      session.context as DialogContext,
    );

    this.logger.log(`Session ${sessionId}: Detected intent "${intentResult.intent}" with confidence ${intentResult.confidence}`);

    // 3. 记录对话日志
    await this.voiceOrderService.logMessage(
      sessionId,
      userId,
      {
        type: 'user',
        text: recognizedText,
        timestamp: new Date(),
      },
      recognizedText,
      intentResult.intent,
      intentResult.entities,
    );

    // 4. 根据意图决定动作
    const action = this.determineAction(
      session.currentStep,
      intentResult,
      session.collectedData,
    );

    // 5. 执行动作
    const result = await this.executeAction(
      sessionId,
      userId,
      action,
      intentResult,
      session,
    );

    // 6. 记录机器人响应
    await this.voiceOrderService.logMessage(
      sessionId,
      userId,
      {
        type: 'bot',
        text: result.botResponse,
        step: result.nextStep,
        timestamp: new Date(),
      },
    );

    return result;
  }

  /**
   * 决定执行的动作
   */
  private determineAction(
    currentStep: DialogStep,
    intentResult: any,
    collectedData: CollectedDataDto,
  ): any {
    const intent = intentResult.intent as VoiceOrderIntent;

    // 处理控制类意图
    switch (intent) {
      case VoiceOrderIntent.SKIP_STEP:
        return { type: 'SKIP_TO_NEXT_STEP' };

      case VoiceOrderIntent.GO_BACK:
        return { type: 'GO_TO_PREVIOUS_STEP' };

      case VoiceOrderIntent.SWITCH_TO_MANUAL:
        return { type: 'SWITCH_TO_MANUAL_MODE' };

      case VoiceOrderIntent.REPEAT_PROMPT:
        return { type: 'REPEAT_CURRENT_PROMPT' };

      case VoiceOrderIntent.CONFIRM_ORDER:
        return { type: 'CONFIRM_AND_CREATE_ORDER' };

      case VoiceOrderIntent.MODIFY_INFO:
        return { type: 'MODIFY_INFORMATION' };

      case VoiceOrderIntent.CANCEL_ORDER:
        return { type: 'CANCEL_ORDER' };
    }

    // 处理信息提供类意图
    if (intentResult.confidence > 0.6) {
      // 检查是否包含当前步骤需要的信息
      const hasCurrentStepData = this.hasRequiredData(
        currentStep,
        intentResult.entities,
      );

      if (hasCurrentStepData) {
        return {
          type: 'COLLECT_DATA_AND_NEXT',
          data: intentResult.entities,
        };
      }

      // 检查是否包含后续步骤的信息（提前提供）
      const futureStepData = this.extractFutureStepData(
        intentResult.entities,
        currentStep,
      );

      if (futureStepData.length > 0) {
        return {
          type: 'COLLECT_FUTURE_DATA',
          data: futureStepData,
        };
      }
    }

    // 默认：重复当前步骤的提示
    return { type: 'REPEAT_CURRENT_PROMPT' };
  }

  /**
   * 检查是否包含当前步骤所需的数据
   */
  private hasRequiredData(
    currentStep: DialogStep,
    entities: Record<string, any>,
  ): boolean {
    const stepRequiredFields: Partial<Record<DialogStep, string[]>> = {
      [DialogStep.ITEM_TYPE]: ['itemType', 'itemCategoryId'],
      [DialogStep.QUANTITY]: ['quantity', 'unit'],
      [DialogStep.ADDRESS]: ['province', 'city', 'district', 'detail'],
      [DialogStep.CONTACT]: ['phone', 'useDefault'],
      [DialogStep.PICKUP_TIME]: ['dateString', 'timePeriod', 'hour'],
    };

    const requiredFields = stepRequiredFields[currentStep] || [];
    return requiredFields.some(field => entities[field] !== undefined);
  }

  /**
   * 提取后续步骤的数据
   */
  private extractFutureStepData(
    entities: Record<string, any>,
    currentStep: DialogStep,
  ): Array<{ step: DialogStep; data: Record<string, any> }> {
    const futureData: Array<{ step: DialogStep; data: Record<string, any> }> = [];
    const stepOrder: DialogStep[] = [
      DialogStep.ITEM_TYPE,
      DialogStep.QUANTITY,
      DialogStep.ADDRESS,
      DialogStep.CONTACT,
      DialogStep.PICKUP_TIME,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);

    // 检查每个后续步骤
    for (let i = currentIndex + 1; i < stepOrder.length; i++) {
      const step = stepOrder[i];
      const stepData: Record<string, any> = {};

      if (step === DialogStep.ITEM_TYPE && (entities.itemType || entities.itemCategoryId)) {
        stepData.itemType = entities.itemType;
        stepData.itemCategoryId = entities.itemCategoryId;
      }

      if (step === DialogStep.QUANTITY && entities.quantity) {
        stepData.quantity = entities.quantity;
        stepData.unit = entities.unit;
      }

      if (step === DialogStep.ADDRESS && entities.province) {
        stepData.address = {
          province: entities.province,
          city: entities.city,
          district: entities.district,
          detail: entities.detail,
        };
      }

      if (step === DialogStep.CONTACT && (entities.phone || entities.useDefault)) {
        stepData.contactPhone = entities.phone;
        stepData.useDefault = entities.useDefault;
      }

      if (step === DialogStep.PICKUP_TIME && (entities.dateString || entities.timeType)) {
        stepData.pickupTime = entities.dateString;
      }

      if (Object.keys(stepData).length > 0) {
        futureData.push({ step, data: stepData });
      }
    }

    return futureData;
  }

  /**
   * 执行动作
   */
  private async executeAction(
    sessionId: string,
    userId: string,
    action: any,
    intentResult: any,
    session: any,
  ): Promise<DialogFlowResult> {
    switch (action.type) {
      case 'COLLECT_DATA_AND_NEXT':
        return this.collectDataAndNext(
          sessionId,
          session.currentStep,
          action.data,
          session.collectedData,
        );

      case 'COLLECT_FUTURE_DATA':
        return this.collectFutureData(
          sessionId,
          session.currentStep,
          action.data,
          session.collectedData,
        );

      case 'SKIP_TO_NEXT_STEP':
        return this.skipToNextStep(sessionId, session.currentStep);

      case 'GO_TO_PREVIOUS_STEP':
        return this.goToPreviousStep(sessionId, session.currentStep);

      case 'REPEAT_CURRENT_PROMPT':
        return this.repeatCurrentPrompt(session.currentStep);

      case 'CONFIRM_AND_CREATE_ORDER':
        return this.confirmAndCreateOrder(session);

      default:
        return this.repeatCurrentPrompt(session.currentStep);
    }
  }

  /**
   * 收集数据并进入下一步
   */
  private async collectDataAndNext(
    sessionId: string,
    currentStep: DialogStep,
    data: Record<string, any>,
    collectedData: CollectedDataDto,
  ): Promise<DialogFlowResult> {
    // 更新收集的数据
    const updatedData = this.mergeCollectedData(collectedData, data);

    // 保存到会话
    const nextStep = this.getNextStep(currentStep);
    await this.voiceOrderService.updateSession(sessionId, {
      currentStep: nextStep,
      collectedData: updatedData,
    });

    // 生成响应
    const prompt = this.dialogTemplateService.getPrompt(nextStep);

    return {
      nextStep,
      updatedData,
      botResponse: prompt,
      suggestedActions: this.getSuggestedActions(nextStep),
    };
  }

  /**
   * 收集后续步骤的数据
   */
  private async collectFutureData(
    sessionId: string,
    currentStep: DialogStep,
    futureData: Array<{ step: DialogStep; data: Record<string, any> }>,
    collectedData: CollectedDataDto,
  ): Promise<DialogFlowResult> {
    // 合并所有数据
    let updatedData = { ...collectedData };
    let nextStep = currentStep;

    for (const { step, data } of futureData) {
      updatedData = this.mergeCollectedData(updatedData, data);
      nextStep = this.getNextStep(step);
    }

    // 保存到会话
    await this.voiceOrderService.updateSession(sessionId, {
      currentStep: nextStep,
      collectedData: updatedData,
    });

    // 生成响应
    const prompt = this.dialogTemplateService.getPrompt(nextStep, {
      collectedCount: Object.keys(updatedData).length.toString(),
    });

    return {
      nextStep,
      updatedData,
      botResponse: `好的！已记录${futureData.length}项信息。${prompt}`,
      suggestedActions: this.getSuggestedActions(nextStep),
    };
  }

  /**
   * 跳过到下一步
   */
  private async skipToNextStep(
    sessionId: string,
    currentStep: DialogStep,
  ): Promise<DialogFlowResult> {
    const nextStep = this.getNextStep(currentStep);

    await this.voiceOrderService.updateSession(sessionId, {
      currentStep: nextStep,
    });

    const prompt = this.dialogTemplateService.getPrompt(nextStep);

    return {
      nextStep,
      updatedData: {},
      botResponse: `好的，我们跳过这一步。${prompt}`,
      suggestedActions: this.getSuggestedActions(nextStep),
    };
  }

  /**
   * 返回上一步
   */
  private async goToPreviousStep(
    sessionId: string,
    currentStep: DialogStep,
  ): Promise<DialogFlowResult> {
    const previousStep = this.getPreviousStep(currentStep);

    await this.voiceOrderService.updateSession(sessionId, {
      currentStep: previousStep,
    });

    const prompt = this.dialogTemplateService.getPrompt(previousStep);

    return {
      nextStep: previousStep,
      updatedData: {},
      botResponse: `好的，我们回到上一步。${prompt}`,
      suggestedActions: this.getSuggestedActions(previousStep),
    };
  }

  /**
   * 重复当前提示
   */
  private repeatCurrentPrompt(currentStep: DialogStep): DialogFlowResult {
    const prompt = this.dialogTemplateService.getPrompt(currentStep);

    return {
      nextStep: currentStep,
      updatedData: {},
      botResponse: prompt,
      suggestedActions: this.getSuggestedActions(currentStep),
    };
  }

  /**
   * 确认并创建订单
   */
  private async confirmAndCreateOrder(session: any): Promise<DialogFlowResult> {
    // TODO: 实现订单创建逻辑

    return {
      nextStep: DialogStep.COMPLETED,
      updatedData: session.collectedData,
      botResponse: '订单创建成功！感谢您的使用。',
      shouldConfirm: false,
    };
  }

  /**
   * 合并收集的数据
   */
  private mergeCollectedData(
    existing: CollectedDataDto,
    newData: Record<string, any>,
  ): CollectedDataDto {
    return {
      ...existing,
      ...newData,
    };
  }

  /**
   * 获取下一步
   */
  private getNextStep(currentStep: DialogStep): DialogStep {
    const stepOrder: DialogStep[] = [
      DialogStep.GREETING,
      DialogStep.ITEM_TYPE,
      DialogStep.QUANTITY,
      DialogStep.ADDRESS,
      DialogStep.CONTACT,
      DialogStep.PICKUP_TIME,
      DialogStep.CONFIRMATION,
      DialogStep.COMPLETED,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
  }

  /**
   * 获取上一步
   */
  private getPreviousStep(currentStep: DialogStep): DialogStep {
    const stepOrder: DialogStep[] = [
      DialogStep.GREETING,
      DialogStep.ITEM_TYPE,
      DialogStep.QUANTITY,
      DialogStep.ADDRESS,
      DialogStep.CONTACT,
      DialogStep.PICKUP_TIME,
      DialogStep.CONFIRMATION,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.max(currentIndex - 1, 0)];
  }

  /**
   * 获取建议操作
   */
  private getSuggestedActions(step: DialogStep): DialogAction[] {
    const actions: DialogAction[] = [];

    switch (step) {
      case DialogStep.ITEM_TYPE:
        actions.push(
          { type: 'quick_select', label: '旧衣服', data: { itemType: '旧衣服' } },
          { type: 'quick_select', label: '旧书籍', data: { itemType: '旧书籍' } },
          { type: 'quick_select', label: '旧家电', data: { itemType: '旧家电' } },
        );
        break;

      case DialogStep.CONTACT:
        actions.push(
          { type: 'use_default', label: '使用默认手机号' },
        );
        break;

      case DialogStep.CONFIRMATION:
        actions.push(
          { type: 'confirm', label: '确认创建订单' },
          { type: 'modify', label: '修改信息' },
        );
        break;
    }

    return actions;
  }
}
