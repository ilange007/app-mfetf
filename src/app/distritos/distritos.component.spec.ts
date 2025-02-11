import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistritosComponent } from './distritos.component';

describe('DistritosComponent', () => {
  let component: DistritosComponent;
  let fixture: ComponentFixture<DistritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistritosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
