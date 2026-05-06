import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AssignTicketDto,
  CreateKnowledgeDto,
  CreateQuickReplyDto,
  CreateSessionDto,
  CreateTicketDto,
  GetMessagesDto,
  MarkAsReadDto,
  QueryKnowledgeDto,
  QueryQuickReplyDto,
  QueryTicketDto,
  ResolveTicketDto,
  SendMessageDto,
  SubmitSatisfactionDto,
  TransferToAgentDto,
  UpdateKnowledgeDto,
  UpdateQuickReplyDto,
  UpdateSessionDto,
  UpdateTicketDto,
} from './dto';
import { AIReplyService } from './services/ai-reply.service';
import { KnowledgeService } from './services/knowledge.service';
import { MessageService } from './services/message.service';
import { QuickReplyService } from './services/quick-reply.service';
import { SessionService } from './services/session.service';
import { TicketService } from './services/ticket.service';

@ApiTags('customer')
@ApiBearerAuth()
@Controller('customer')
export class CustomerServiceController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly messageService: MessageService,
    private readonly aiReplyService: AIReplyService,
    private readonly ticketService: TicketService,
    private readonly knowledgeService: KnowledgeService,
    private readonly quickReplyService: QuickReplyService,
  ) { }

  @Post('sessions')
  @ApiOperation({ summary: '创建客服会话' })
  async createSession(@Body() dto: CreateSessionDto, @Request() req: any) {
    const userId = dto.userId || req.user?.sub;
    if (!userId) {
      console.error(
        '[CreateSession] Missing userId. dto.userId:',
        dto.userId,
        'req.user?.sub:',
        req.user?.sub,
        'req.user:',
        req.user,
      );
      throw new BadRequestException('无法获取用户ID，请重新登录');
    }
    return this.sessionService.create({ ...dto, userId });
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: '获取会话详情' })
  async getSession(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Get('sessions')
  @ApiOperation({ summary: '获取用户会话列表' })
  async getUserSessions(@Request() req: any) {
    const userId = req.user?.sub;
    return this.sessionService.getUserSessions(userId);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: '更新会话' })
  async updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Put('sessions/:id/close')
  @ApiOperation({ summary: '关闭会话' })
  async closeSession(@Param('id') id: string) {
    return this.sessionService.close(id);
  }

  @Post('sessions/:id/transfer')
  @ApiOperation({ summary: '转接人工客服' })
  async transferToAgent(
    @Param('id') id: string,
    @Body() dto: TransferToAgentDto,
  ) {
    return this.sessionService.transferToAgent(id, dto);
  }

  @Post('sessions/:id/satisfaction')
  @ApiOperation({ summary: '提交满意度评价' })
  async submitSatisfaction(
    @Param('id') id: string,
    @Body() dto: SubmitSatisfactionDto,
  ) {
    return this.sessionService.submitSatisfaction(id, dto);
  }

  @Post('messages')
  @ApiOperation({ summary: '发送消息' })
  async sendMessage(@Body() dto: SendMessageDto, @Request() req: any) {
    const userId = req.user?.sub;
    const isAgent = req.user?.role === 'agent' || req.user?.role === 'staff';
    return this.messageService.send(dto, userId, isAgent);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: '获取消息列表' })
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Query() dto: GetMessagesDto,
  ) {
    return this.messageService.getMessages({ ...dto, sessionId });
  }

  @Put('messages/read')
  @ApiOperation({ summary: '标记消息已读' })
  async markAsRead(@Body() dto: MarkAsReadDto) {
    await this.messageService.markAsRead(dto);
    return { success: true };
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.sub;
    const count = await this.messageService.getTotalUnreadCount(userId);
    return { count };
  }

  @Post('tickets')
  @ApiOperation({ summary: '创建工单' })
  async createTicket(@Body() dto: CreateTicketDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.ticketService.create(dto, userId);
  }

  @Get('tickets')
  @ApiOperation({ summary: '获取工单列表' })
  async getTickets(@Query() dto: QueryTicketDto) {
    return this.ticketService.findAll(dto);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: '获取工单详情' })
  async getTicket(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: '更新工单' })
  async updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketService.update(id, dto);
  }

  @Post('tickets/:id/assign')
  @ApiOperation({ summary: '分配工单' })
  async assignTicket(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @Request() req: any,
  ) {
    const operatorId = req.user?.sub;
    return this.ticketService.assign(id, dto, operatorId);
  }

  @Post('tickets/:id/resolve')
  @ApiOperation({ summary: '解决工单' })
  async resolveTicket(
    @Param('id') id: string,
    @Body() dto: ResolveTicketDto,
    @Request() req: any,
  ) {
    const operatorId = req.user?.sub;
    return this.ticketService.resolve(id, dto, operatorId);
  }

  @Post('tickets/:id/close')
  @ApiOperation({ summary: '关闭工单' })
  async closeTicket(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req: any,
  ) {
    const operatorId = req.user?.sub;
    return this.ticketService.close(id, operatorId, body.comment);
  }

  @Post('tickets/:id/reopen')
  @ApiOperation({ summary: '重开工单' })
  async reopenTicket(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    const operatorId = req.user?.sub;
    return this.ticketService.reopen(id, operatorId, body.reason);
  }

  @Get('tickets/stats')
  @ApiOperation({ summary: '获取工单统计' })
  async getTicketStats() {
    return this.ticketService.getStats();
  }

  @Get('knowledge')
  @ApiOperation({ summary: '获取知识库列表' })
  async getKnowledgeList(@Query() dto: QueryKnowledgeDto) {
    return this.knowledgeService.findAll(dto);
  }

  @Post('knowledge')
  @ApiOperation({ summary: '创建知识条目' })
  async createKnowledge(@Body() dto: CreateKnowledgeDto) {
    return this.knowledgeService.create(dto);
  }

  @Put('knowledge/:id')
  @ApiOperation({ summary: '更新知识条目' })
  async updateKnowledge(
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeDto,
  ) {
    return this.knowledgeService.update(id, dto);
  }

  @Get('knowledge/categories')
  @ApiOperation({ summary: '获取知识库分类' })
  async getKnowledgeCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get('knowledge/hot')
  @ApiOperation({ summary: '获取热门问题' })
  async getHotQuestions(@Query('limit') limit?: number) {
    return this.knowledgeService.getHotQuestions(limit);
  }

  @Post('ai/process')
  @ApiOperation({ summary: 'AI处理消息（测试接口）' })
  async processAIMessage(
    @Body() body: { sessionId: string; message: string },
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    return this.aiReplyService.processMessage(
      body.sessionId,
      userId,
      body.message,
    );
  }

  @Get('quick-replies')
  @ApiOperation({ summary: '获取快捷回复列表' })
  async getQuickReplies(@Query() dto: QueryQuickReplyDto, @Request() req: any) {
    const agentId = req.user?.sub;
    return this.quickReplyService.findAll(dto, agentId);
  }

  @Post('quick-replies')
  @ApiOperation({ summary: '创建快捷回复' })
  async createQuickReply(
    @Body() dto: CreateQuickReplyDto,
    @Request() req: any,
  ) {
    const agentId = req.user?.sub;
    return this.quickReplyService.create(dto, agentId);
  }

  @Get('quick-replies/:id')
  @ApiOperation({ summary: '获取快捷回复详情' })
  async getQuickReply(@Param('id') id: string) {
    return this.quickReplyService.findOne(id);
  }

  @Put('quick-replies/:id')
  @ApiOperation({ summary: '更新快捷回复' })
  async updateQuickReply(
    @Param('id') id: string,
    @Body() dto: UpdateQuickReplyDto,
  ) {
    return this.quickReplyService.update(id, dto);
  }

  @Delete('quick-replies/:id')
  @ApiOperation({ summary: '删除快捷回复' })
  async deleteQuickReply(@Param('id') id: string) {
    await this.quickReplyService.delete(id);
    return { success: true };
  }

  @Get('quick-replies/categories')
  @ApiOperation({ summary: '获取快捷回复分类' })
  async getQuickReplyCategories() {
    return this.quickReplyService.getCategories();
  }
}
