import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaQuestionComponent } from './qa-question.component';

describe('QaQuestionComponent', () => {
  let component: QaQuestionComponent;
  let fixture: ComponentFixture<QaQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QaQuestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
