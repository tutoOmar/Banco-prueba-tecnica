import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteModalComponent } from './delete-modal.component';

describe('DeleteModalComponent', () => {
  let component: DeleteModalComponent;
  let fixture: ComponentFixture<DeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModalComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe mostrar el mensaje correctamente', () => {
    const testMessage = '¿Estás seguro de eliminar el producto Test?';
    component.message = testMessage;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.confirm-text')?.textContent).toBe(testMessage);
  });

  it('debe emitir confirm al hacer click en el botón Confirmar', () => {
    jest.spyOn(component.confirm, 'emit');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-primary');
    btn.click();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('debe emitir cancel al hacer click en el botón Cancelar', () => {
    jest.spyOn(component.cancel, 'emit');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-secondary');
    btn.click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('debe emitir cancel al presionar la tecla Escape', () => {
    jest.spyOn(component.cancel, 'emit');
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
