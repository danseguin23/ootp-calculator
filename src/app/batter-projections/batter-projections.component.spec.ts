import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatterProjectionsComponent } from './batter-projections.component';

describe('BatterProjectionsComponent', () => {
  let component: BatterProjectionsComponent;
  let fixture: ComponentFixture<BatterProjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatterProjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatterProjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
