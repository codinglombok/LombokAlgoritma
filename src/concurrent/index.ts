/** Simple semaphore for async coordination */
export class Semaphore {
  private count: number;
  private readonly queue: Array<() => void> = [];

  constructor(initialCount: number) {
    this.count = initialCount;
  }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return;
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }

  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.count++;
    }
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/** Read-Write Lock — allows multiple readers or one writer */
export class ReadWriteLock {
  private readers = 0;
  private writing = false;
  private readonly readQueue: Array<() => void> = [];
  private readonly writeQueue: Array<() => void> = [];

  async readLock(): Promise<void> {
    if (!this.writing && this.writeQueue.length === 0) {
      this.readers++;
      return;
    }
    return new Promise((r) =>
      this.readQueue.push(() => {
        this.readers++;
        r();
      }),
    );
  }

  readUnlock(): void {
    this.readers--;
    if (this.readers === 0) this.writeQueue.shift()?.();
  }

  async writeLock(): Promise<void> {
    if (this.readers === 0 && !this.writing) {
      this.writing = true;
      return;
    }
    return new Promise((r) =>
      this.writeQueue.push(() => {
        this.writing = true;
        r();
      }),
    );
  }

  writeUnlock(): void {
    this.writing = false;
    if (this.writeQueue.length > 0) {
      this.writeQueue.shift()?.();
    } else {
      const pending = this.readQueue.splice(0);
      for (const r of pending) r();
    }
  }
}

/** Lock-free double-ended queue (single-threaded JS version) */
export class Deque<T> {
  private head: number;
  private tail: number;
  private buf: (T | undefined)[];
  private mask: number;

  constructor(capacity = 16) {
    const cap = nextPow2Deque(capacity);
    this.buf = new Array<T | undefined>(cap);
    this.head = 0;
    this.tail = 0;
    this.mask = cap - 1;
  }

  pushBack(item: T): void {
    if (this.size === this.buf.length - 1) this.grow();
    this.buf[this.tail & this.mask] = item;
    this.tail++;
  }

  pushFront(item: T): void {
    if (this.size === this.buf.length - 1) this.grow();
    this.head--;
    this.buf[this.head & this.mask] = item;
  }

  popBack(): T | undefined {
    if (this.head === this.tail) return undefined;
    this.tail--;
    const v = this.buf[this.tail & this.mask];
    this.buf[this.tail & this.mask] = undefined;
    return v;
  }

  popFront(): T | undefined {
    if (this.head === this.tail) return undefined;
    const v = this.buf[this.head & this.mask];
    this.buf[this.head & this.mask] = undefined;
    this.head++;
    return v;
  }

  get size(): number {
    return this.tail - this.head;
  }
  get isEmpty(): boolean {
    return this.head === this.tail;
  }

  private grow(): void {
    const newBuf = new Array<T | undefined>(this.buf.length * 2);
    for (let i = 0; i < this.size; i++) newBuf[i] = this.buf[(this.head + i) & this.mask];
    this.tail = this.size;
    this.head = 0;
    this.buf = newBuf;
    this.mask = newBuf.length - 1;
  }
}

function nextPow2Deque(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}
