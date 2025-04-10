import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileManagementModalComponent } from './file-management-modal.component';

describe('FileManagementModalComponent', () => {
  let component: FileManagementModalComponent;
  let fixture: ComponentFixture<FileManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileManagementModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
