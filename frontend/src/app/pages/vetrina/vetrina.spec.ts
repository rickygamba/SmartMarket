import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vetrina } from './vetrina';

describe('Vetrina', () => {
  let component: Vetrina;
  let fixture: ComponentFixture<Vetrina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vetrina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vetrina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
