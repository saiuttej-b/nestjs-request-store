import { type CanActivate, Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RequestStoreModule, RequestStoreService } from '../../index';

type AppStore = {
  userId: string;
};

@Injectable()
class ActorGuard implements CanActivate {
  constructor(private readonly requestStore: RequestStoreService<AppStore>) {}

  canActivate(): boolean {
    this.requestStore.setValue('userId', 'user-1');
    return true;
  }
}

@Injectable()
class ReaderService {
  constructor(private readonly requestStore: RequestStoreService<AppStore>) {}

  currentUser(): string {
    return this.requestStore.getOrThrow('userId');
  }
}

@Controller()
class DirectController {
  constructor(private readonly requestStore: RequestStoreService) {}

  @Get()
  get(): { ok: boolean } {
    this.requestStore.getValue('userId');
    return { ok: true };
  }
}

@Controller()
class ProbeController {
  constructor(private readonly reader: ReaderService) {}

  @Get()
  @UseGuards(ActorGuard)
  get(): { userId: string } {
    return { userId: this.reader.currentUser() };
  }
}

describe('HTTP middleware', () => {
  it('does not open a store when http is disabled', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RequestStoreModule.forRoot()],
      controllers: [DirectController],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.useLogger(false);
    await app.init();

    try {
      await request(app.getHttpServer()).get('/').expect(500);
    } finally {
      await app.close();
    }
  });

  it('shares the store from a guard to a service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RequestStoreModule.forRoot({ http: true })],
      controllers: [ProbeController],
      providers: [ActorGuard, ReaderService],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    try {
      await request(app.getHttpServer()).get('/').expect(200).expect({ userId: 'user-1' });
    } finally {
      await app.close();
    }
  });
});
