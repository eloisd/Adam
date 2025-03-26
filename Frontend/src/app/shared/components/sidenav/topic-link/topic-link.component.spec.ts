import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicLinkComponent } from './topic-link.component';

describe('TopicLinkComponent', () => {
  let component: TopicLinkComponent;
  let fixture: ComponentFixture<TopicLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
