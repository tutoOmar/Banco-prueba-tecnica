import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRevisionValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const release = group.get('date_release')?.value;
    const revision = group.get('date_revision')?.value;

    if (!release || !revision) return null;

    const releaseDate = new Date(release);
    const revisionDate = new Date(revision);

    const expectedRevisionDate = new Date(releaseDate);
    expectedRevisionDate.setFullYear(expectedRevisionDate.getFullYear() + 1);

    const isExactlyOneYearLater = 
      revisionDate.getTime() === expectedRevisionDate.getTime();

    return isExactlyOneYearLater ? null : { invalidDateRevision: true };
  };
}
