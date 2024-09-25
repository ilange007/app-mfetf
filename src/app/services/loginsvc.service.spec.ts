import { TestBed } from '@angular/core/testing';

import { LoginsvcService } from './loginsvc.service';

describe('LoginsvcService', () => {
  let service: LoginsvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginsvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
