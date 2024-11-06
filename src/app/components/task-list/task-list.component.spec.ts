import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Task } from '../../models/task.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ChangeDetectorRef } from '@angular/core';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dialog: jasmine.SpyObj<MatDialog>;


  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', status: 'Concluído' },
    { id: '2', title: 'Task 2', status: 'Pendente' },
    { id: '3', title: 'Task 3', status: 'Em andamento' },
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'addTask',
      'updateTask',
      'deleteTask',
      'exportToCSV',
      'exportToExcel'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        ChangeDetectorRef
      ]
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    taskService.getTasks.and.returnValue(of(mockTasks));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService.getTasks.and.returnValue(of(mockTasks));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(taskService.getTasks).toHaveBeenCalled();
    expect(component.tasks).toEqual(mockTasks);
    expect(component.filteredTasks).toEqual(mockTasks);
  }));

  it('should handle error when loading tasks', fakeAsync(() => {
    taskService.getTasks.and.returnValue(throwError(() => new Error('Error')));

    component.ngOnInit();
    tick();

    expect(notificationService.error).toHaveBeenCalledWith('Erro ao carregar as tarefas');
  }));

  it('should filter tasks by status', () => {
    component.ngOnInit();

    component.statusFilter = 'Concluído';
    component.applyFilters();

    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].status).toBe('Concluído');
  });

  it('should filter tasks by search term', fakeAsync(() => {
    component.tasks = mockTasks;
    component.filteredTasks = mockTasks;
    component.searchTerm = 'Task 1';
    component.applyFilters();
    tick();
    fixture.detectChanges();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].id).toBe('1');
    expect(component.filteredTasks[0].title).toContain('Task 1');
  }));

  it('should track by task id', () => {
    const task = mockTasks[0];
    expect(component.trackByTaskId(0, task)).toBe(task.id || '0');
  });

  it('should open add dialog and create task', fakeAsync(() => {
    const newTask = { id: '4', title: 'New Task', status: 'pending', description: 'New Description', createdAt: new Date() };
    const mockDialogRef = {
      afterClosed: () => of(newTask)
    };
    dialog.open.and.returnValue(mockDialogRef as any);
    taskService.addTask.and.returnValue(of(newTask) as any);

    component.openAddDialog();
    tick();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalled();
    expect(taskService.addTask).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Tarefa criada com sucesso!');
  }));

  it('should handle delete confirmation', fakeAsync(() => {
    const mockDialogRef = {
      afterClosed: () => of(true)
    };
    dialog.open.and.returnValue(mockDialogRef as any);
    taskService.deleteTask.and.returnValue(of(void 0) as any);

    component.confirmDelete(mockTasks[0]);
    tick();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalled();
    expect(taskService.deleteTask).toHaveBeenCalledWith(mockTasks[0].id as string);
    expect(notificationService.success).toHaveBeenCalledWith('Tarefa excluída com sucesso!');
  }));

  it('should update filtered tasks when applying search filter', fakeAsync(() => {
    component.tasks = mockTasks;
    component.filteredTasks = mockTasks;

    component.searchTerm = 'Task 1';
    component.applyFilters();
    tick();
    fixture.detectChanges();

    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].title).toContain('Task 1');
  }));

  it('should show all tasks when search term is empty', fakeAsync(() => {
    component.tasks = mockTasks;
    component.filteredTasks = mockTasks;

    component.searchTerm = '';
    component.applyFilters();
    tick();
    fixture.detectChanges();

    expect(component.filteredTasks.length).toBe(mockTasks.length);
  }));

  it('should handle case-insensitive search', fakeAsync(() => {
    component.tasks = mockTasks;
    component.filteredTasks = mockTasks;

    component.searchTerm = 'task';
    component.applyFilters();
    tick();
    fixture.detectChanges();

    expect(component.filteredTasks.length).toBe(3);
  }));

  it('should combine status and search filters', fakeAsync(() => {
    component.tasks = mockTasks;
    component.filteredTasks = mockTasks;

    component.statusFilter = 'Pendente';
    component.searchTerm = 'Task';
    component.applyFilters();
    tick();
    fixture.detectChanges();

    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].status).toBe('Pendente');
    expect(component.filteredTasks[0].title).toContain('Task');
  }));

  it('should handle CSV export successfully', fakeAsync(() => {
    taskService.exportToCSV.and.returnValue(of(void 0) as any);

    component.exportToCSV();
    tick();
    fixture.detectChanges();

    expect(taskService.exportToCSV).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Arquivo CSV exportado com sucesso!');
  }));

  it('should handle Excel export successfully', fakeAsync(() => {
    taskService.exportToExcel.and.returnValue(of(void 0) as any);

    component.exportToExcel();
    tick();
    fixture.detectChanges();

    expect(taskService.exportToExcel).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Arquivo Excel exportado com sucesso!');
  }));

  it('should handle error on CSV export', () => {
    taskService.exportToCSV.and.throwError('Erro ao exportar para CSV');
    component.exportToCSV();
    expect(notificationService.error).toHaveBeenCalledWith('Erro ao exportar para CSV');
  });

  it('should handle error on Excel export', fakeAsync(() => {
    taskService.exportToExcel.and.callFake(() => { throw new Error('Erro ao exportar para Excel'); });
    component.exportToExcel();
    expect(notificationService.error).toHaveBeenCalledWith('Erro ao exportar para Excel');
  }));
});
