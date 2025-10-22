import { Injectable } from '@nestjs/common';

import CreateMessageDto from './dto/create-message.dto';
import UpdateMessageDto from './dto/update-message.dto copy';

// TODO: move types to separate file
export type TNullable<T> = T | undefined;

export interface IUserMessage {
  id: number;
  content: string;
}

enum ENotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface ISystemResponse<T> {
  timestamp: Date;
  type: ENotificationType;
  message: string;
  data: T;
}

@Injectable()
export class MessagesService {
  // TODO: fake dataset
  private messages: Array<IUserMessage> = [
    { id: 1, content: 'Random message number UNO' },
    { id: 2, content: 'Random message number DOS' },
    { id: 3, content: 'Random message number TRES' },
  ];
  private nextId = 4;

  getMessages(): ISystemResponse<Array<IUserMessage>> {
    // return a shallow copy so callers can't mutate internal array directly
    return {
      timestamp: new Date(),
      type: ENotificationType.SUCCESS,
      message: 'Messages retrieved successfully',
      data: [...this.messages],
    };
  }

  createMessage(createMessageDto: CreateMessageDto): ISystemResponse<IUserMessage> {
    const newMessage: IUserMessage = {
      id: this.nextId++,
      content: createMessageDto.content,
    };

    this.messages = [...this.messages, newMessage];

    return {
      timestamp: new Date(),
      type: ENotificationType.SUCCESS,
      message: 'Message created successfully',
      data: newMessage,
    };
  }

  deleteMessages(): ISystemResponse<Array<IUserMessage>> {
    this.messages = [];

    return {
      timestamp: new Date(),
      type: ENotificationType.SUCCESS,
      message: 'All messages deleted successfully',
      data: [...this.messages],
    };
  }

  getMessageById(messageId: number): ISystemResponse<TNullable<IUserMessage>> {
    const found = this.messages.find((m) => m.id === messageId);

    if (found) {
      return {
        timestamp: new Date(),
        type: ENotificationType.SUCCESS,
        message: `Message with ID ${messageId} retrieved successfully`,
        data: { ...found }, // return copy
      };
    }

    return {
      timestamp: new Date(),
      type: ENotificationType.ERROR,
      message: `Message with ID ${messageId} not found`,
      data: undefined,
    };
  }

  updateMessageById(
    messageId: number,
    updateMessageDto: UpdateMessageDto,
  ): ISystemResponse<TNullable<IUserMessage>> {
    const index = this.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      // Not found — return consistent error shape with data = undefined
      return {
        timestamp: new Date(),
        type: ENotificationType.ERROR,
        message: `Message with ID ${messageId} not found`,
        data: undefined,
      };
    }

    // Merge the existing message with the provided patch (updateMessageDto)
    const updated: IUserMessage = {
      ...this.messages[index],
      ...updateMessageDto,
    };

    // Persist
    this.messages = [...this.messages.slice(0, index), updated, ...this.messages.slice(index + 1)];

    return {
      timestamp: new Date(),
      type: ENotificationType.SUCCESS,
      message: `Message with ID ${messageId} updated successfully`,
      data: { ...updated }, // return copy
    };
  }

  deleteMessageById(messageId: number): ISystemResponse<TNullable<IUserMessage>> {
    const index = this.messages.findIndex((m) => m.id === messageId);

    if (index === -1) {
      return {
        timestamp: new Date(),
        type: ENotificationType.ERROR,
        message: `Message with ID ${messageId} not found`,
        data: undefined,
      };
    }

    const [removed] = this.messages.splice(index, 1);

    return {
      timestamp: new Date(),
      type: ENotificationType.SUCCESS,
      message: `Message with ID ${messageId} deleted successfully`,
      data: removed,
    };
  }
}
