import { FormControl } from '@angular/forms';
import { dateReleaseValidator } from './date-release.validator';

describe('dateReleaseValidator', () => {
  const validator = dateReleaseValidator();

  it('debe retornar null si el control está vacío', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('debe retornar null si la fecha es hoy', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const control = new FormControl(dateStr);
    expect(validator(control)).toBeNull();
  });

  it('debe retornar null si la fecha es futura', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const control = new FormControl(dateStr);
    expect(validator(control)).toBeNull();
  });

  it('debe retornar error si la fecha es pasada', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, '0');
    const day = String(past.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const control = new FormControl(dateStr);
    expect(validator(control)).toEqual({ invalidDateRelease: true });
  });
});
