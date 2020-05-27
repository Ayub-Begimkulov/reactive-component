import { makeSet } from "../utils";

const jobs: (() => void)[] = [];
const promise = Promise.resolve();
let pending = false;

export const nextTick = (fn?: () => void) => (fn ? promise.then(fn) : promise);

export const queueJob = (job: () => void) => {
  jobs.push(job);
  queueFlush();
};

const queueFlush = () => {
  if (!pending) {
    pending = true;
    nextTick(flushJobs);
  }
};

const flushJobs = () => {
  const jobsToRun = makeSet(jobs);
  jobs.length = 0;
  jobsToRun.forEach(job => job());
  if (jobs.length > 0) {
    flushJobs();
  }
  pending = false;
};
