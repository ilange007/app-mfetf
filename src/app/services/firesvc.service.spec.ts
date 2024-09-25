import { TestBed } from '@angular/core/testing';

import { FiresvcService } from './firesvc.service';

describe('FiresvcService', () => {
  let service: FiresvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiresvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
