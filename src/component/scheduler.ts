const jobs: Set<() => void> = new Set();
const promise = Promise.resolve();
let isRunning = false;

export const nextTick = (fn?: () => void) => (fn ? promise.then(fn) : promise);

export const queueJob = (job: () => void) => {
  jobs.add(job);
  runJobs();
};

const runJobs = () => {
  if (!isRunning) {
    isRunning = true;
    nextTick(() => {
      jobs.forEach(job => job());
      isRunning = false;
    });
  }
};
