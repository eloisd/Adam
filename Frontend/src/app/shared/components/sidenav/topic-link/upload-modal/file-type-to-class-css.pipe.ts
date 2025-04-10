import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileTypeToClassCss'
})
export class FileTypeToClassCssPipe implements PipeTransform {
  acceptedFileTypes: Record<string, string> = {
    'application/pdf': 'pdf',
    'text/plain': 'text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
    'application/json': 'json',
  }

  transform(value: string): string {
    return this.acceptedFileTypes[value] || 'unknown';
  }

}
