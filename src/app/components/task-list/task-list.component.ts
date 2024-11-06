import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  statusFilter: string = 'all';
  searchTerm: string = '';

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.notification.error('Erro ao carregar as tarefas');
        console.error('Erro ao carregar tarefas:', error);
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        try {
          this.taskService.addTask(result);
          this.notification.success('Tarefa criada com sucesso!');
        } catch (error) {
          this.notification.error('Erro ao criar a tarefa');
          console.error('Erro ao criar tarefa:', error);
        }
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { ...task }
    });

    dialogRef.afterClosed().subscribe((result: Task | undefined) => {
      if (result) {
        try {
          this.taskService.updateTask(result);
          this.notification.success('Tarefa atualizada com sucesso!');
        } catch (error) {
          this.notification.error('Erro ao atualizar a tarefa');
          console.error('Erro ao atualizar tarefa:', error);
        }
      }
    });
  }

  openDetailDialog(task: Task): void {
    this.dialog.open(TaskDetailComponent, {
      width: '500px',
      data: task
    });
  }

  confirmDelete(task: Task): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, DialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '300px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja excluir a tarefa "${task.title}"?`
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        try {
          this.taskService.deleteTask(task.id as string);
          this.notification.success('Tarefa excluída com sucesso!');
        } catch (error) {
          this.notification.error('Erro ao excluir a tarefa');
          console.error('Erro ao excluir tarefa:', error);
        }
        this.taskService.deleteTask(task.id as string);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.tasks];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredTasks = filtered;
  }

  exportToCSV(): void {
    try {
      this.taskService.exportToCSV();
      this.notification.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      this.notification.error('Erro ao exportar para CSV');
      console.error('Erro ao exportar para CSV:', error);
    }
  }

  exportToExcel(): void {
    try {
      this.taskService.exportToExcel();
      this.notification.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      this.notification.error('Erro ao exportar para Excel');
      console.error('Erro ao exportar para Excel:', error);
    }
  }
}
