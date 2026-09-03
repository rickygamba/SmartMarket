import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prodotto } from './prodotto';

describe('Prodotto', () => {
  let component: Prodotto;
  let fixture: ComponentFixture<Prodotto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prodotto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prodotto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
