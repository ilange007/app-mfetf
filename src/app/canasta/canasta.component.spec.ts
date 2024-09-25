import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanastaComponent } from './canasta.component';

describe('CanastaComponent', () => {
  let component: CanastaComponent;
  let fixture: ComponentFixture<CanastaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanastaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanastaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
