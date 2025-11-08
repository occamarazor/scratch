import type { Nullable } from '@common/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm';

import CreateMessageDto from './dto/create-message.dto';
import UpdateMessageDto from './dto/update-message.dto';
import { MessageEntity } from './entities/message.entity';
import type { Message } from './messages.types';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messagesRepository: Repository<MessageEntity>,
  ) {}

  private toDomain(e: MessageEntity): Message {
    return { id: e.id, content: e.content, createdAt: e.createdAt, updatedAt: e.updatedAt };
  }

  async getMessages(): Promise<Message[]> {
    const entities: MessageEntity[] = await this.messagesRepository.find({ order: { id: 'ASC' } });
    return entities.map((e) => this.toDomain(e));
  }

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const entity: MessageEntity = this.messagesRepository.create({ content: dto.content });
    const saved: MessageEntity = await this.messagesRepository.save(entity);
    return this.toDomain(saved);
  }

  async deleteMessages(): Promise<void> {
    await this.messagesRepository.clear();
  }

  async getMessageById(id: number): Promise<Nullable<Message>> {
    const entity: Nullable<MessageEntity> =
      (await this.messagesRepository.findOne({ where: { id } })) ?? undefined;
    return entity ? this.toDomain(entity) : undefined;
  }

  async updateMessageById(id: number, dto: UpdateMessageDto): Promise<Nullable<Message>> {
    const entity: Nullable<MessageEntity> =
      (await this.messagesRepository.findOne({ where: { id } })) ?? undefined;

    if (!entity) return undefined;

    this.messagesRepository.merge(entity, dto as Partial<MessageEntity>);
    const saved: MessageEntity = await this.messagesRepository.save(entity);
    return this.toDomain(saved);
  }

  async deleteMessageById(id: number): Promise<boolean> {
    const result: DeleteResult = await this.messagesRepository.delete(id);
    return (result.affected ?? 0) === 1;
  }
}
