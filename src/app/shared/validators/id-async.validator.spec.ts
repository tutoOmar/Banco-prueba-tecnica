import { FormControl } from '@angular/forms';
import { of, throwError, timer } from 'rxjs';
import { idAsyncValidator } from './id-async.validator';
import { FinancialProductsService } from '../services/financial-products.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('idAsyncValidator', () => {
  let service: jest.Mocked<FinancialProductsService>;

  beforeEach(() => {
    service = {
      verifyId: jest.fn()
    } as any;
  });

  it('debe retornar null si el control no tiene valor', (done) => {
    const validator = idAsyncValidator(service);
    const control = new FormControl('');
    
    validator(control).subscribe(result => {
      expect(result).toBeNull();
      done();
    });
  });

  it('debe retornar idExists: true si el ID existe', fakeAsync(() => {
    service.verifyId.mockReturnValue(of(true));
    const validator = idAsyncValidator(service);
    const control = new FormControl('existing-id');
    
    let result: any;
    validator(control).subscribe(res => result = res);
    
    tick(400);
    expect(result).toEqual({ idExists: true });
    expect(service.verifyId).toHaveBeenCalledWith('existing-id');
  }));

  it('debe retornar null si el ID no existe', fakeAsync(() => {
    service.verifyId.mockReturnValue(of(false));
    const validator = idAsyncValidator(service);
    const control = new FormControl('new-id');
    
    let result: any;
    validator(control).subscribe(res => result = res);
    
    tick(400);
    expect(result).toBeNull();
  }));

  it('debe retornar null si hay un error en el servicio', fakeAsync(() => {
    service.verifyId.mockReturnValue(throwError(() => new Error('Error')));
    const validator = idAsyncValidator(service);
    const control = new FormControl('error-id');
    
    let result: any;
    validator(control).subscribe(res => result = res);
    
    tick(400);
    expect(result).toBeNull();
  }));
});
