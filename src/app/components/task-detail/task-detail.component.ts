import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public task: Task
  ) {}

  getStatusColor(status: string): string {
    switch(status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
