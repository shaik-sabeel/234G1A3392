/**
 * Priority Weight Mapping for Notification Types
 * Placement > Result > Event
 */
const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

/**
 * Extracts and parses the timestamp from a notification.
 * Safe fallback if timestamp is missing or malformed.
 * 
 * @param {Object} notification 
 * @returns {number} Unix timestamp in ms
 */
function getTimestampMs(notification) {
  if (!notification.Timestamp) return 0;
  // Replace space with 'T' for ISO 8601 compatibility
  const isoString = notification.Timestamp.replace(' ', 'T');
  const parsed = Date.parse(isoString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Compares two notifications for priority.
 * Returns negative if a has LOWER priority than b,
 * positive if a has HIGHER priority than b,
 * and 0 if they are equal.
 * 
 * @param {Object} a 
 * @param {Object} b 
 * @returns {number}
 */
function compareNotifications(a, b) {
  const weightA = TYPE_WEIGHTS[a.Type?.toLowerCase()] || 0;
  const weightB = TYPE_WEIGHTS[b.Type?.toLowerCase()] || 0;

  // 1. Compare Weights
  if (weightA !== weightB) {
    return weightA - weightB;
  }

  // 2. Compare Recency (Timestamps)
  const timeA = getTimestampMs(a);
  const timeB = getTimestampMs(b);

  return timeA - timeB;
}

/**
 * Min-Heap implementation to maintain the top 'N' highest priority items.
 * Keeps the "smallest" (lowest priority) element at the root (index 0).
 */
class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] || null;
  }

  push(item) {
    if (this.size() < this.maxSize) {
      this.heap.push(item);
      this._bubbleUp(this.size() - 1);
    } else if (compareNotifications(item, this.peek()) > 0) {
      // New item has HIGHER priority than the lowest priority item in our top N.
      // Replace the root and heapify down.
      this.heap[0] = item;
      this._bubbleDown(0);
    }
  }

  getSortedList() {
    // Return the items sorted in descending order of priority (highest priority first)
    return [...this.heap].sort((a, b) => compareNotifications(b, a));
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (compareNotifications(this.heap[index], this.heap[parentIndex]) < 0) {
        // Child has lower priority than parent, swap to keep min-heap property
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.size();
    while (true) {
      let smallestIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && compareNotifications(this.heap[leftChild], this.heap[smallestIndex]) < 0) {
        smallestIndex = leftChild;
      }

      if (rightChild < length && compareNotifications(this.heap[rightChild], this.heap[smallestIndex]) < 0) {
        smallestIndex = rightChild;
      }

      if (smallestIndex !== index) {
        this._swap(index, smallestIndex);
        index = smallestIndex;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

/**
 * Filter and sort a collection of notifications to find the top N.
 * 
 * @param {Array<Object>} notifications - Array of raw notification objects
 * @param {number} n - Number of priority notifications to return (default 10)
 * @param {Array<string>} [readIds] - Optional list of notification IDs that are already read
 * @returns {Array<Object>} The sorted top N notifications
 */
function getPriorityNotifications(notifications, n = 10, readIds = []) {
  if (!Array.isArray(notifications)) return [];

  const heap = new MinHeap(n);
  const readSet = new Set(readIds);

  for (const notif of notifications) {
    // Filter out read notifications if any
    if (readSet.has(notif.ID)) {
      continue;
    }
    heap.push(notif);
  }

  return heap.getSortedList();
}

module.exports = {
  compareNotifications,
  MinHeap,
  getPriorityNotifications
};
