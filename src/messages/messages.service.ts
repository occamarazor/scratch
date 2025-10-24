import type { Nullable, Response } from '@common/types';
import { Notification } from '@common/types';
import { Message } from '@messages/messages.types';
import { Injectable } from '@nestjs/common';

import CreateMessageDto from './dto/create-message.dto';
import UpdateMessageDto from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  // TODO: fake dataset
  private messages: Array<Message> = [
    { id: 1, content: 'Random message number UNO' },
    { id: 2, content: 'Random message number DOS' },
    { id: 3, content: 'Random message number TRES' },
  ];
  private nextId = 4;

  getMessages(): Response<Array<Message>> {
    // return a shallow copy so callers can't mutate internal array directly
    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: 'Messages retrieved successfully',
      data: [...this.messages],
    };
  }

  createMessage(createMessageDto: CreateMessageDto): Response<Message> {
    const newMessage: Message = {
      id: this.nextId++,
      content: createMessageDto.content,
    };

    this.messages = [...this.messages, newMessage];

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: 'Message created successfully',
      data: newMessage,
    };
  }

  deleteMessages(): Response<Array<Message>> {
    this.messages = [];

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: 'All messages deleted successfully',
      data: [...this.messages],
    };
  }

  getMessageById(messageId: number): Response<Nullable<Message>> {
    const found = this.messages.find((m) => m.id === messageId);

    if (found) {
      return {
        timestamp: new Date(),
        type: Notification.SUCCESS,
        message: `Message with ID ${messageId} retrieved successfully`,
        data: { ...found }, // return copy
      };
    }

    return {
      timestamp: new Date(),
      type: Notification.ERROR,
      message: `Message with ID ${messageId} not found`,
      data: undefined,
    };
  }

  updateMessageById(
    messageId: number,
    updateMessageDto: UpdateMessageDto,
  ): Response<Nullable<Message>> {
    const index = this.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      // Not found — return consistent error shape with data = undefined
      return {
        timestamp: new Date(),
        type: Notification.ERROR,
        message: `Message with ID ${messageId} not found`,
        data: undefined,
      };
    }

    // Merge the existing message with the provided patch (updateMessageDto)
    const updated: Message = {
      ...this.messages[index],
      ...updateMessageDto,
    };

    // Persist
    this.messages = [...this.messages.slice(0, index), updated, ...this.messages.slice(index + 1)];

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: `Message with ID ${messageId} updated successfully`,
      data: { ...updated }, // return copy
    };
  }

  deleteMessageById(messageId: number): Response<Nullable<Message>> {
    const index = this.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      return {
        timestamp: new Date(),
        type: Notification.ERROR,
        message: `Message with ID ${messageId} not found`,
        data: undefined,
      };
    }

    const [removed] = this.messages.splice(index, 1);

    return {
      timestamp: new Date(),
      type: Notification.SUCCESS,
      message: `Message with ID ${messageId} deleted successfully`,
      data: removed,
    };
  }
}
