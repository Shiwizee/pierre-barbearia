import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoBarbeiroPage } from './historico-barbeiro.page';

describe('HistoricoBarbeiroPage', () => {
  let component: HistoricoBarbeiroPage;
  let fixture: ComponentFixture<HistoricoBarbeiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoBarbeiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
