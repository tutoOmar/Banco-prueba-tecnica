import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError, first } from 'rxjs/operators';
import { FinancialProductsService } from '../../core/services/financial-products.service';

export function idAsyncValidator(service: FinancialProductsService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return timer(400).pipe(
      switchMap(() => service.verifyId(control.value)),
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null)),
      first()
    );
  };
}
