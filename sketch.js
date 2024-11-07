let values = [];
let states = [];
let sorter = null;
let isSorting = false;
let comparisons = 0;
let swaps = 0;
let isPaused = false;
function setup() {
    createCanvas(800, 400);
    frameRate(3);
    resetArray();

    // Setup array size slider event
    document.getElementById('arraySize').addEventListener('input', function () {
        document.getElementById('arraySizeValue').textContent = this.value;
        if (!isSorting) {
            resetArray();
        }
    });

    // Setup speed slider event
    document.getElementById('speedSlider').addEventListener('input', function () {
        document.getElementById('speedValue').textContent = this.value;
    });
}

function resetArray() {
    values = [];
    states = [];
    isSorting = false;
    sorter = null;
    comparisons = 0;
    swaps = 0;
    updateStats('None');

    const arraySize = parseInt(document.getElementById('arraySize').value);

    // Generate random values
    for (let i = 0; i < arraySize; i++) {
        values.push(random(50, height - 50));
        states.push(-1);
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pauseResumeButton").textContent = isPaused ? "▶️" : "⏸";
}

function updateStats(algorithm) {
    document.getElementById('currentAlgorithm').textContent = algorithm;
    document.getElementById('comparisons').textContent = comparisons;
    document.getElementById('swaps').textContent = swaps;
}
// New function to set custom array from user input
function setCustomArray() {
    let input = document.getElementById('customArrayInput').value;
    let customValues = input.split(',').map(Number).filter(num => !isNaN(num));

    if (customValues.length > 0) {
        values = customValues.map(v => map(v, 0, Math.max(...customValues), 50, height - 50));
        states = new Array(values.length).fill(-1);
        isSorting = false;
        sorter = null;
        comparisons = 0;
        swaps = 0;
        updateStats('None');
    } else {
        alert("Please enter valid numbers separated by commas.");
    }
}
function draw() {
    background(220);

    // Draw bars
    for (let i = 0; i < values.length; i++) {
        let x = map(i, 0, values.length, 0, width);
        let w = width / values.length;

        // Color coding based on state
        if (states[i] == 0) {
            fill(255, 0, 0); // Red for active comparison
        } else if (states[i] == 1) {
            fill(0, 255, 0); // Green for sorted
        } else if (states[i] == 2) {
            fill(255, 165, 0); // Orange for pivot/key
        } else {
            fill(100); // Gray for unsorted
        }

        rect(x, height - values[i], w - 1, values[i]);
    }

    // Continue sorting if active
    if (isSorting && sorter && !isPaused) {
        for (let i = 0; i < getSpeed(); i++) {
            let result = sorter.next();
            if (result.done) {
                isSorting = false;
                markAllAsSorted();
            }
        }
        updateStats(currentAlgorithm);
    }
}

function getSpeed() {
    return parseInt(document.getElementById('speedSlider').value);
}

function markAllAsSorted() {
    for (let i = 0; i < states.length; i++) {
        states[i] = 1;
    }
}

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    swaps++;
}

// Sorting algorithms with comparison counting
function* bubbleSort() {
    currentAlgorithm = 'Bubble Sort';
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values.length - i - 1; j++) {
            states[j] = 0;
            states[j + 1] = 0;
            comparisons++;

            if (values[j] > values[j + 1]) {
                swap(values, j, j + 1);
            }

            yield;
            states[j] = -1;
            states[j + 1] = -1;
        }
        states[values.length - i - 1] = 1;
    }
}

function* selectionSort() {
    currentAlgorithm = 'Selection Sort';
    for (let i = 0; i < values.length; i++) {
        let minIdx = i;
        states[i] = 2;

        for (let j = i + 1; j < values.length; j++) {
            states[j] = 0;
            comparisons++;

            if (values[j] < values[minIdx]) {
                if (minIdx !== i) states[minIdx] = -1;
                minIdx = j;
                states[minIdx] = 2;
            }

            yield;
            if (j !== minIdx) states[j] = -1;
        }

        if (minIdx !== i) {
            swap(values, i, minIdx);
            states[minIdx] = -1;
        }
        states[i] = 1;
        yield;
    }
}

function* insertionSort() {
    currentAlgorithm = 'Insertion Sort';
    for (let i = 1; i < values.length; i++) {
        let key = values[i];
        let j = i - 1;
        states[i] = 2;
        yield;
        comparisons++;
        while (j >= 0 && values[j] > key) {
            states[j] = 0;
            comparisons++;
            values[j + 1] = values[j];
            states[j + 1] = 0;
            j--;
            yield;
        }
        if (j + 1 != i) swaps++;
        values[j + 1] = key;

        for (let k = 0; k <= i; k++) {
            states[k] = 1;
        }
        yield;
    }
}

function* mergeSort(arr = values, left = 0, right = values.length - 1) {
    currentAlgorithm = 'Merge Sort';
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);
    yield* mergeSort(arr, left, mid);
    yield* mergeSort(arr, mid + 1, right);
    yield* merge(arr, left, mid, right);
}

function* merge(arr, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    let leftArr = arr.slice(left, mid + 1);
    let rightArr = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        states[k] = 0; // Comparison
        comparisons++;

        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i++];
        } else {
            arr[k] = rightArr[j++];
        }
        k++;
        yield;
    }

    while (i < n1) {
        arr[k] = leftArr[i++];
        k++;
        yield;
    }

    while (j < n2) {
        arr[k] = rightArr[j++];
        k++;
        yield;
    }

    for (let l = left; l <= right; l++) {
        states[l] = 1; // Sorted state
    }
}

// Quick Sort generator function
function* quickSort(arr = values, low = 0, high = values.length - 1) {
    currentAlgorithm = 'Quick Sort';
    if (low < high) {
        let pivotIdx = yield* partition(arr, low, high);
        yield* quickSort(arr, low, pivotIdx - 1);
        yield* quickSort(arr, pivotIdx + 1, high);
    }
}

function* partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    states[high] = 2;
    for (let j = low; j < high; j++) {
        states[j] = 0; // Active comparison
        comparisons++;

        if (arr[j] < pivot) {
            i++;
            swap(arr, i, j);
            yield;
        }
        states[j] = -1;
    }
    swap(arr, i + 1, high);
    states[high] = -1;
    states[i + 1] = 1; // Pivot sorted
    yield;
    return i + 1;
}

function startSorting(algorithm) {
    if (isSorting) return;

    isSorting = true;
    states = new Array(values.length).fill(-1);
    comparisons = 0;
    swaps = 0;

    switch (algorithm) {
        case 'bubble':
            sorter = bubbleSort();
            break;
        case 'selection':
            sorter = selectionSort();
            break;
        case 'insertion':
            sorter = insertionSort();
            break;
        case 'merge':
            sorter = mergeSort();
            break;
        case 'quick':
            sorter = quickSort();
            break;
    }
}