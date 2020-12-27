import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionCalculatorComponent } from './position-calculator.component';

describe('PositionCalculatorComponent', () => {
  let component: PositionCalculatorComponent;
  let fixture: ComponentFixture<PositionCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionCalculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
