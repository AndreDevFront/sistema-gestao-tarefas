import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'tasks';
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedTasks = localStorage.getItem(this.STORAGE_KEY);
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
      this.tasksSubject.next(this.tasks);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    this.tasksSubject.next(this.tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(task: Task): void {
    task.id = Date.now().toString();
    task.createdAt = new Date();
    this.tasks.unshift(task);
    this.saveToLocalStorage();
  }

  updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.saveToLocalStorage();
    }
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveToLocalStorage();
  }

  exportToCSV(): void {
    const headers = ['ID', 'Título', 'Descrição', 'Status', 'Data de Criação'];
    const csvData = this.tasks.map(task => [
      task.id,
      task.title,
      task.description,
      task.status,
      task.createdAt ? new Date(task.createdAt).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tarefas_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  exportToExcel(): void {
    const headers = ['ID', 'Título', 'Descrição', 'Status', 'Data de Criação'];
    const data = this.tasks.map(task => ({
      ID: task.id,
      Título: task.title,
      Descrição: task.description,
      Status: task.status,
      'Data de Criação': task.createdAt ? new Date(task.createdAt).toLocaleString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarefas');
    XLSX.writeFile(workbook, `tarefas_${new Date().toISOString()}.xlsx`);
  }
}
