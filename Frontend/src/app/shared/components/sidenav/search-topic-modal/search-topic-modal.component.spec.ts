import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTopicModalComponent } from './search-topic-modal.component';

describe('SearchTopicModalComponent', () => {
  let component: SearchTopicModalComponent;
  let fixture: ComponentFixture<SearchTopicModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchTopicModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchTopicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
