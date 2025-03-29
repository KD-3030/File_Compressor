export { BinaryHeap };

class BinaryHeap {
    constructor() {
        this.heap = [];
    }

    insert(value) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error("Inserted value must be a non-empty array with priority as the first element.");
        }
        this.heap.push(value);
        this.bubbleUp();
    }

    size() {
        return this.heap.length;
    }

    empty() {
        return this.size() === 0;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    bubbleUp() {
        let index = this.size() - 1;

        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);

            if (this.heap[parentIndex][0] >= this.heap[index][0]) break;

            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    extractMax() {
        if (this.empty()) return null;

        const max = this.heap[0];
        const tmp = this.heap.pop();
        if (!this.empty()) {
            this.heap[0] = tmp;
            this.sinkDown(0);
        }
        return max;
    }

    sinkDown(index) {
        let largest = index;
        const length = this.size();
        let left = 2 * index + 1;
        let right = 2 * index + 2;

        if (left < length && this.heap[left][0] > this.heap[largest][0]) {
            largest = left;
        }
        if (right < length && this.heap[right][0] > this.heap[largest][0]) {
            largest = right;
        }

        if (largest !== index) {
            this.swap(index, largest);
            this.sinkDown(largest);
        }
    }
}
