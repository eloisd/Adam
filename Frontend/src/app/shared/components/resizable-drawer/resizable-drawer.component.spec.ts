import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizableDrawerComponent } from './resizable-drawer.component';

describe('ResizableDrawerComponent', () => {
  let component: ResizableDrawerComponent;
  let fixture: ComponentFixture<ResizableDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizableDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResizableDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
