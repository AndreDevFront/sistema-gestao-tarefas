import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    service.success('Test message');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test message',
      'Fechar',
      jasmine.objectContaining({
        panelClass: ['snackbar-success']
      })
    );
  });

  it('should show error notification', () => {
    service.error('Test message');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test message',
      'Fechar',
      jasmine.objectContaining({
        panelClass: ['snackbar-error']
      })
    );
  });

  it('should show warning notification', () => {
    service.warning('Test message');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test message',
      'Fechar',
      jasmine.objectContaining({
        panelClass: ['snackbar-warning']
      })
    );
  });

  it('should show info notification', () => {
    service.info('Test message');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test message',
      'Fechar',
      jasmine.objectContaining({
        panelClass: ['snackbar-info']
      })
    );
  });
});
