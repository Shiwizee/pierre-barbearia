import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeBarbeiroPage } from './home-barbeiro.page';

describe('HomeBarbeiroPage', () => {
  let component: HomeBarbeiroPage;
  let fixture: ComponentFixture<HomeBarbeiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeBarbeiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
