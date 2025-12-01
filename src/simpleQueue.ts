// Минимальная очередь через массив
interface ReviewTask {
  code: string;
  repo: string;
  pr_number: number;
}

export const reviewQueue: ReviewTask[] = [];

export const addTask = (task: ReviewTask) => {
  reviewQueue.push(task);
};

export const getNextTask = (): ReviewTask | undefined => {
  return reviewQueue.shift();
};
