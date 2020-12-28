import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionsComponent } from './projections.component';

describe('ProjectionsComponent', () => {
  let component: ProjectionsComponent;
  let fixture: ComponentFixture<ProjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
