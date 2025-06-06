import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McqQuestionComponent } from './mcq-question.component';

describe('McqQuestionComponent', () => {
  let component: McqQuestionComponent;
  let fixture: ComponentFixture<McqQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McqQuestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McqQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
