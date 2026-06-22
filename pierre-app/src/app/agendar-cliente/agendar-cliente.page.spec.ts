import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendarClientePage } from './agendar-cliente.page';

describe('AgendarClientePage', () => {
  let component: AgendarClientePage;
  let fixture: ComponentFixture<AgendarClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendarClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
