import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) {
    this.isEditMode = !!data;
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      status: ['Pendente', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.taskForm.patchValue(this.data);
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const task = this.taskForm.value;
      if (this.isEditMode) {
        task.id = this.data.id;
        task.createdAt = this.data.createdAt;
      }
      this.dialogRef.close(task);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
