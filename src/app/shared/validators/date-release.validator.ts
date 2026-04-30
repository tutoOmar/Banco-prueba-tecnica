import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateReleaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse YYYY-MM-DD as local date to avoid timezone shifts
    const [year, month, day] = control.value.split('-').map(Number);
    const releaseDate = new Date(year, month - 1, day);
    
    return releaseDate >= today ? null : { invalidDateRelease: true };
  };
}
