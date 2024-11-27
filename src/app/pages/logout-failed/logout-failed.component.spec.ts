import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutFailedComponent } from './logout-failed.component';

describe('LogoutFailedComponent', () => {
  let component: LogoutFailedComponent;
  let fixture: ComponentFixture<LogoutFailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutFailedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogoutFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
