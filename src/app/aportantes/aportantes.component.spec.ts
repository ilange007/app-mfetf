import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportantesComponent } from './aportantes.component';

describe('AportantesComponent', () => {
  let component: AportantesComponent;
  let fixture: ComponentFixture<AportantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AportantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
