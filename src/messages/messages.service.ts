import type { Nullable } from '@common/types';
import type { Message } from '@messages/messages.types';
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

  getMessages(): Array<Message> {
    return [...this.messages];
  }

  createMessage(createMessageDto: CreateMessageDto): Message {
    const newMessage: Message = {
      id: this.nextId++,
      content: createMessageDto.content,
    };

    this.messages = [...this.messages, newMessage];
    return newMessage;
  }

  deleteMessages(): void {
    this.messages = [];
  }

  getMessageById(messageId: number): Nullable<Message> {
    return this.messages.find((m) => m.id === messageId);
  }

  updateMessageById(messageId: number, updateMessageDto: UpdateMessageDto): Nullable<Message> {
    const foundMessage: Nullable<Message> = this.getMessageById(messageId);
    if (!foundMessage) return foundMessage;

    const updatedMessage: Message = { ...foundMessage, ...updateMessageDto };
    this.messages = this.messages.map((m) => (m.id === messageId ? updatedMessage : m));
    return updatedMessage;
  }

  deleteMessageById(messageId: number): Nullable<Message> {
    const foundMessage: Nullable<Message> = this.getMessageById(messageId);
    if (foundMessage) this.messages = this.messages.filter((m) => m.id !== messageId);

    return foundMessage;
  }
}
