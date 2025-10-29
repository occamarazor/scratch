// src/messages/messages.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessageEntity } from './entities/message.entity';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let repository: Repository<MessageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(MessageEntity),
          useClass: Repository, // mock repository
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    repository = module.get<Repository<MessageEntity>>(getRepositoryToken(MessageEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getMessages', () => {
    it('should return all messages', async () => {
      const expected = [{ id: 1, content: 'test' }];
      jest.spyOn(repository, 'find').mockResolvedValue(expected as MessageEntity[]);

      const result = await service.getMessages();
      expect(result).toEqual(expected);
    });
  });
});
