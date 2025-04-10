import { TestBed } from '@angular/core/testing';

import { GroupTopicsService } from './group-topics.service';

describe('GroupTopicsService', () => {
  let service: GroupTopicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupTopicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
