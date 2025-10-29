// src/messages/messages.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';

import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  const mockMessagesService = {
    getMessages: jest.fn().mockResolvedValue([{ id: 1, content: 'hello' }]),
    createMessage: jest.fn().mockResolvedValue({ id: 1, content: 'hello' }),
    getMessageById: jest.fn().mockResolvedValue({ id: 1, content: 'hello' }),
    updateMessageById: jest.fn().mockResolvedValue({ id: 1, content: 'updated' }),
    deleteMessageById: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: mockMessagesService }],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return all messages', async () => {
    const result = await controller.getMessages();
    expect(result.data[0].content).toBe('hello');
    expect(service.getMessages).toHaveBeenCalled();
  });
});
