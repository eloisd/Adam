import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBubbleBotComponent } from './chat-bubble-bot.component';

describe('ChatBubbleBotComponent', () => {
  let component: ChatBubbleBotComponent;
  let fixture: ComponentFixture<ChatBubbleBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBubbleBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatBubbleBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
