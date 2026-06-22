import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendamentosBarbeiroPage } from './agendamentos-barbeiro.page';

describe('AgendamentosBarbeiroPage', () => {
  let component: AgendamentosBarbeiroPage;
  let fixture: ComponentFixture<AgendamentosBarbeiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendamentosBarbeiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
