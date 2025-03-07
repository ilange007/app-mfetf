import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAporteDialogComponent } from './add-aporte-dialog.component';

describe('AddAporteDialogComponent', () => {
  let component: AddAporteDialogComponent;
  let fixture: ComponentFixture<AddAporteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAporteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAporteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
