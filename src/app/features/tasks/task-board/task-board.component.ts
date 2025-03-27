import { Component, OnInit } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { CommonModule } from '@angular/common';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.tasks = []; // Load tasks from service later
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id);
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
}
