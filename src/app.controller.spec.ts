import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return Central Buy API info', () => {
      const result = appController.root();
      expect(result.name).toBe('Central Buy API');
      expect(result.docs).toBe('/api/docs');
    });
  });

  describe('health', () => {
    it('should return health status ok', () => {
      const result = appController.health();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
    });
  });
});
