import type { ISystemResponse, TNullable } from '@common/types';
import type { IUserMessage } from '@messages/messages.types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import CreateMessageDto from './dto/create-message.dto';
import UpdateMessageDto from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('/api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(): ISystemResponse<Array<IUserMessage>> {
    return this.messagesService.getMessages();
  }

  @Post()
  createMessage(@Body() createMessageDto: CreateMessageDto): ISystemResponse<IUserMessage> {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT) // Sets a 204 status code for successful deletion
  removeAll() {
    return this.messagesService.deleteMessages();
  }

  @Get(':id')
  getMessageById(@Param('id') id: string): ISystemResponse<TNullable<IUserMessage>> {
    return this.messagesService.getMessageById(+id);
  }

  @Patch(':id')
  updateMessageById(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): ISystemResponse<TNullable<IUserMessage>> {
    return this.messagesService.updateMessageById(+id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMessageById(@Param('id') id: string): ISystemResponse<TNullable<IUserMessage>> {
    return this.messagesService.deleteMessageById(+id);
  }
}
