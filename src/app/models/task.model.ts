export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'Pendente' | 'Em andamento' | 'Concluído';
  createdAt?: Date | undefined;
}
