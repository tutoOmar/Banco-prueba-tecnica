import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateReleaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const releaseDate = new Date(control.value);
    releaseDate.setMinutes(releaseDate.getMinutes() + releaseDate.getTimezoneOffset());
    releaseDate.setHours(0, 0, 0, 0);
    
    return releaseDate >= today ? null : { invalidDateRelease: true };
  };
}
