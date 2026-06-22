import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilClienteVisualizadoPage } from './perfil-cliente-visualizado.page';

describe('PerfilClienteVisualizadoPage', () => {
  let component: PerfilClienteVisualizadoPage;
  let fixture: ComponentFixture<PerfilClienteVisualizadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilClienteVisualizadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
