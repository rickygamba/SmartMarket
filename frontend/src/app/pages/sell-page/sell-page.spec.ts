import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellPage } from './sell-page';

describe('SellPage', () => {
  let component: SellPage;
  let fixture: ComponentFixture<SellPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
