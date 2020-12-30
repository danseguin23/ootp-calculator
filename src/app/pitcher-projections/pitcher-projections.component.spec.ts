import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PitcherProjectionsComponent } from './pitcher-projections.component';

describe('PitcherProjectionsComponent', () => {
  let component: PitcherProjectionsComponent;
  let fixture: ComponentFixture<PitcherProjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PitcherProjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PitcherProjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
