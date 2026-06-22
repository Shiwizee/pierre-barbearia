import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarClientesPage } from './gerenciar-clientes.page';

describe('GerenciarClientesPage', () => {
  let component: GerenciarClientesPage;
  let fixture: ComponentFixture<GerenciarClientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GerenciarClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
