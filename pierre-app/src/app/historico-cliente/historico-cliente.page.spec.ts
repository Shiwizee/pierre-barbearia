import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoClientePage } from './historico-cliente.page';

describe('HistoricoClientePage', () => {
  let component: HistoricoClientePage;
  let fixture: ComponentFixture<HistoricoClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
