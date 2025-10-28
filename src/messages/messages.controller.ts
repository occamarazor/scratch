import type { Nullable, Response } from '@common/types';
import { Notification } from '@common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import CreateMessageDto from './dto/create-message.dto';
import UpdateMessageDto from './dto/update-message.dto';
import { MessagesService } from './messages.service';
import type { Message } from './messages.types';

@Controller('/api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(): Response<Array<Message>> {
    const allMessages: Array<Message> = this.messagesService.getMessages();
    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: 'Messages retrieved successfully',
      data: allMessages,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createMessage(@Body() createMessageDto: CreateMessageDto): Response<Message> {
    const newMessage: Message = this.messagesService.createMessage(createMessageDto);
    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: 'Message created successfully',
      data: newMessage,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAll(): void {
    this.messagesService.deleteMessages();
    return;
  }

  @Get(':id')
  getMessageById(@Param('id', ParseIntPipe) id: number): Response<Nullable<Message>> {
    const foundMessage: Nullable<Message> = this.messagesService.getMessageById(id);

    if (!foundMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: `Message with ID ${id} retrieved successfully`,
      data: foundMessage,
    };
  }

  @Patch(':id')
  updateMessageById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Response<Nullable<Message>> {
    const updatedMessage: Nullable<Message> = this.messagesService.updateMessageById(
      id,
      updateMessageDto,
    );

    if (!updatedMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: `Message with ID ${id} updated successfully`,
      data: updatedMessage,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMessageById(@Param('id', ParseIntPipe) id: number): void {
    const removedMessage: Nullable<Message> = this.messagesService.deleteMessageById(id);

    if (!removedMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return;
  }
}
