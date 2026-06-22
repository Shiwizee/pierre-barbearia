import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloquearHorariosPage } from './bloquear-horarios.page';

describe('BloquearHorariosPage', () => {
  let component: BloquearHorariosPage;
  let fixture: ComponentFixture<BloquearHorariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BloquearHorariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
