import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRevisionValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const release = group.get('date_release')?.value;
    const revision = group.get('date_revision')?.value;

    if (!release || !revision) return null;

    const [relYear, relMonth, relDay] = release.split('-').map(Number);
    const [revYear, revMonth, revDay] = revision.split('-').map(Number);

    const isExactlyOneYearLater = 
      revYear === relYear + 1 && 
      revMonth === relMonth && 
      revDay === relDay;

    return isExactlyOneYearLater ? null : { invalidDateRevision: true };
  };
}
