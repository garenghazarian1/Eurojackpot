// app.js
class EurojackpotAnalyzer {
  constructor(pastDraws) {
    this.pastDraws = pastDraws || [];
    this.mainRange = { min: 1, max: 50 };
    this.euroRange = { min: 1, max: 12 };
    this.analyzeHistory();
  }

  analyzeHistory() {
    this.mainFrequency = this.calculateFrequency("main");
    this.euroFrequency = this.calculateFrequency("euro");
    this.hotMain = this.getHotNumbers("main", 15);
    this.coldMain = this.getColdNumbers("main", 15);
    this.hotEuro = this.getHotNumbers("euro", 5);
    this.coldEuro = this.getColdNumbers("euro", 5);
  }

  calculateFrequency(type) {
    const range = type === "main" ? this.mainRange : this.euroRange;
    const freqMap = new Map();

    // Initialize frequency map
    for (let i = range.min; i <= range.max; i++) {
      freqMap.set(i, 0);
    }

    // Count occurrences
    this.pastDraws.forEach((draw) => {
      const numbers = draw[type];
      numbers.forEach((num) => {
        if (freqMap.has(num)) {
          freqMap.set(num, freqMap.get(num) + 1);
        }
      });
    });

    return freqMap;
  }

  getHotNumbers(type, count) {
    return this.getNumbersByFrequency(type, count, false);
  }

  getColdNumbers(type, count) {
    return this.getNumbersByFrequency(type, count, true);
  }

  getNumbersByFrequency(type, count, ascending) {
    const freqMap = type === "main" ? this.mainFrequency : this.euroFrequency;
    const sorted = Array.from(freqMap.entries()).sort((a, b) => {
      return ascending ? a[1] - b[1] : b[1] - a[1];
    });
    return sorted.slice(0, count).map(([num]) => num);
  }

  generateCombination(strategy = "balanced", quantity = 1) {
    const results = [];
    for (let i = 0; i < quantity; i++) {
      let mainNumbers, euroNumbers;

      switch (strategy) {
        case "hot":
          mainNumbers = this.selectHotColdNumbers(this.hotMain, 5);
          euroNumbers = this.selectHotColdNumbers(this.hotEuro, 2);
          break;
        case "cold":
          mainNumbers = this.selectHotColdNumbers(this.coldMain, 5);
          euroNumbers = this.selectHotColdNumbers(this.coldEuro, 2);
          break;
        case "balanced":
        default:
          mainNumbers = this.selectBalancedNumbers();
          euroNumbers = this.selectBalancedEuroNumbers();
          break;
      }

      results.push({
        main: this.sortNumbers(mainNumbers),
        euro: this.sortNumbers(euroNumbers),
        strategy,
        generatedAt: new Date().toISOString(),
      });
    }
    return results;
  }

  selectHotColdNumbers(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  selectBalancedNumbers() {
    const numbers = new Set();
    const decades = [1, 11, 21, 31, 41];

    // Select one number from each decade
    decades.forEach((start) => {
      const decadeNumbers = Array.from({ length: 10 }, (_, i) => start + i);
      const availableNumbers = decadeNumbers.filter((n) => !numbers.has(n));
      if (availableNumbers.length > 0) {
        numbers.add(this.randomChoice(availableNumbers));
      }
    });

    // Fill remaining numbers
    while (numbers.size < 5) {
      const pool = Math.random() < 0.7 ? this.hotMain : this.coldMain;
      const candidates = pool.filter((n) => !numbers.has(n));
      if (candidates.length > 0) {
        numbers.add(this.randomChoice(candidates));
      }
    }

    return this.applyNumberRules([...numbers]);
  }

  selectBalancedEuroNumbers() {
    const numbers = new Set();
    const lowRange = Array.from({ length: 6 }, (_, i) => i + 1);
    const highRange = Array.from({ length: 6 }, (_, i) => i + 7);

    // Select one low and one high number
    if (lowRange.length > 0) numbers.add(this.randomChoice(lowRange));
    if (highRange.length > 0) numbers.add(this.randomChoice(highRange));

    // Fill remaining if needed
    while (numbers.size < 2) {
      const pool = Math.random() < 0.7 ? this.hotEuro : this.coldEuro;
      const candidates = pool.filter((n) => !numbers.has(n));
      if (candidates.length > 0) {
        numbers.add(this.randomChoice(candidates));
      }
    }

    return this.sortNumbers([...numbers]);
  }

  applyNumberRules(numbers) {
    let adjusted = [...numbers];
    adjusted = this.removeConsecutiveNumbers(adjusted);
    adjusted = this.balanceOddEven(adjusted);
    return this.sortNumbers(adjusted);
  }

  removeConsecutiveNumbers(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        const replacement = this.findReplacement(sorted[i], sorted);
        sorted[i] = replacement;
      }
    }
    return sorted;
  }

  findReplacement(currentNumber, existingNumbers) {
    const candidates = Array.from({ length: 50 }, (_, i) => i + 1).filter(
      (n) => !existingNumbers.includes(n)
    );
    return this.randomChoice(candidates);
  }

  balanceOddEven(numbers) {
    const odd = numbers.filter((n) => n % 2 === 1);
    const even = numbers.filter((n) => n % 2 === 0);

    while (Math.abs(odd.length - even.length) > 1) {
      if (odd.length > even.length) {
        even.push(odd.shift());
      } else {
        odd.push(even.shift());
      }
    }

    return [...odd, ...even].sort((a, b) => a - b);
  }

  sortNumbers(numbers) {
    return [...numbers].sort((a, b) => a - b);
  }

  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

// UI Controller
document.addEventListener("DOMContentLoaded", () => {
  const savedNumbers2024 = [
    { main: [2, 21, 26, 34, 49], euro: [7, 12] },
    { main: [1, 9, 25, 27, 37], euro: [6, 8] },
    { main: [9, 15, 28, 36, 39], euro: [6, 7] },
    { main: [1, 3, 10, 32, 44], euro: [1, 8] },
    { main: [11, 14, 18, 35, 42], euro: [4, 11] },
    { main: [1, 4, 19, 35, 42], euro: [1, 3] },
    { main: [17, 23, 30, 41, 43], euro: [4, 11] },
    { main: [8, 14, 45, 47, 50], euro: [2, 12] },
    { main: [7, 20, 23, 24, 37], euro: [4, 10] },
    { main: [10, 19, 24, 25, 40], euro: [5, 9] },
    { main: [20, 21, 28, 32, 37], euro: [1, 5] },
    { main: [6, 10, 30, 34, 41], euro: [7, 10] },
    { main: [4, 7, 19, 26, 27], euro: [4, 5] },
    { main: [27, 31, 35, 46, 50], euro: [3, 10] },
    { main: [2, 3, 34, 38, 49], euro: [10, 11] },
    { main: [6, 23, 38, 42, 45], euro: [9, 12] },
    { main: [22, 29, 36, 38, 43], euro: [1, 6] },
    { main: [13, 21, 27, 28, 41], euro: [1, 3] },
    { main: [3, 17, 26, 30, 49], euro: [1, 10] },
    { main: [2, 19, 36, 42, 50], euro: [4, 9] },
    { main: [4, 32, 36, 38, 47], euro: [3, 9] },
    { main: [2, 4, 23, 30, 40], euro: [4, 10] },
    { main: [9, 20, 38, 44, 45], euro: [4, 12] },
    { main: [8, 11, 23, 44, 45], euro: [10, 12] },
    { main: [13, 29, 42, 44, 48], euro: [2, 8] },
    { main: [4, 16, 27, 34, 44], euro: [4, 7] },
    { main: [17, 37, 42, 45, 50], euro: [6, 7] },
    { main: [6, 15, 25, 29, 41], euro: [1, 3] },
    { main: [3, 13, 34, 41, 43], euro: [1, 5] },
    { main: [9, 17, 19, 26, 39], euro: [4, 10] },
    { main: [1, 3, 13, 24, 44], euro: [11, 12] },
    { main: [2, 3, 17, 40, 44], euro: [4, 8] },
    { main: [7, 10, 31, 41, 46], euro: [1, 5] },
    { main: [7, 11, 27, 42, 45], euro: [3, 10] },
    { main: [5, 17, 23, 36, 37], euro: [5, 9] },
    { main: [8, 11, 25, 31, 48], euro: [11, 12] },
    { main: [15, 24, 29, 33, 39], euro: [2, 9] },
    { main: [13, 21, 22, 26, 48], euro: [2, 7] },
    { main: [25, 28, 29, 31, 33], euro: [6, 12] },
    { main: [4, 11, 16, 46, 50], euro: [1, 3] },
    { main: [6, 9, 33, 34, 50], euro: [1, 7] },
    { main: [15, 18, 25, 29, 35], euro: [1, 5] },
    { main: [4, 9, 22, 32, 35], euro: [9, 10] },
    { main: [14, 20, 26, 30, 31], euro: [1, 2] },
    { main: [2, 16, 30, 31, 49], euro: [2, 5] },
    { main: [7, 11, 22, 26, 46], euro: [5, 11] },
    { main: [9, 13, 21, 24, 38], euro: [6, 12] },
    { main: [13, 18, 22, 26, 32], euro: [10, 11] },
    { main: [8, 22, 27, 36, 43], euro: [5, 8] },
    { main: [2, 14, 30, 32, 34], euro: [3, 4] },
    { main: [5, 14, 25, 26, 44], euro: [8, 10] },
    { main: [4, 11, 16, 25, 32], euro: [1, 11] },
    { main: [10, 29, 30, 32, 40], euro: [6, 12] },
  ];

  let analyzer = null;
  let currentDraws = [];

  // DOM Elements
  const elements = {
    load2024: document.getElementById("load2024"),
    quickInput: document.getElementById("quickInput"),
    addNumbers: document.getElementById("addNumbers"),
    csvInput: document.getElementById("csvInput"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    generateBtn: document.getElementById("generateBtn"),
    results: document.getElementById("results"),
    mainFrequencyChart: document.getElementById("mainFrequencyChart"),
    euroFrequencyChart: document.getElementById("euroFrequencyChart"),
    drawCount: document.getElementById("drawCount"),
    sourceTags: document.getElementById("sourceTags"),
    fileName: document.getElementById("fileName"),
  };

  // Event Listeners
  elements.load2024.addEventListener("click", load2024Numbers);
  elements.addNumbers.addEventListener("click", addManualNumbers);
  elements.csvInput.addEventListener("change", handleCSVUpload);
  elements.analyzeBtn.addEventListener("click", analyzeNumbers);
  elements.generateBtn.addEventListener("click", generateCombinations);

  function load2024Numbers() {
    currentDraws = [...savedNumbers2024];
    updateUI();
    addSourceTag("2024 Numbers");
    showMessage("2024 numbers loaded successfully!");
  }

  function addManualNumbers() {
    const input = elements.quickInput.value.trim();
    if (!input) return;

    const newDraws = parseInput(input);
    if (newDraws.length > 0) {
      currentDraws.push(...newDraws);
      elements.quickInput.value = "";
      updateUI();
      addSourceTag("Manual Input");
      showMessage(`${newDraws.length} draw(s) added`);
    }
  }

  async function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const newDraws = parseCSV(text);
    if (newDraws.length > 0) {
      currentDraws.push(...newDraws);
      elements.fileName.textContent = file.name;
      updateUI();
      addSourceTag("CSV Upload");
      showMessage(`${newDraws.length} draws imported from CSV`);
    }
  }

  function analyzeNumbers() {
    if (currentDraws.length < 5) {
      showMessage("Error: Minimum 5 draws required for analysis", true);
      return;
    }

    analyzer = new EurojackpotAnalyzer(currentDraws);
    renderCharts();
    showMessage("Analysis completed! Ready to generate numbers");
  }

  function generateCombinations() {
    if (!analyzer) {
      showMessage("Error: Please analyze numbers first", true);
      return;
    }

    const strategy = document.getElementById("strategy").value;
    const quantity =
      parseInt(document.getElementById("quantity").value, 10) || 1;
    const combos = analyzer.generateCombination(strategy, quantity);
    renderCombinations(combos);
  }

  function parseInput(input) {
    return input.split("\n").reduce((draws, line) => {
      line = line.trim();
      if (!line) return draws;

      const [mainPart, euroPart] = line.split("|").map((p) => p.trim());
      if (!mainPart || !euroPart) return draws;

      const main = mainPart
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const euro = euroPart
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));

      if (main.length === 5 && euro.length === 2) {
        draws.push({ main, euro });
      }
      return draws;
    }, []);
  }

  function parseCSV(csvData) {
    return csvData.split("\n").reduce((draws, line) => {
      line = line.trim();
      if (!line || line.startsWith("date,")) return draws;

      const parts = line.split("|");
      if (parts.length !== 2) return draws;

      const main = parts[0]
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const euro = parts[1]
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));

      if (main.length === 5 && euro.length === 2) {
        draws.push({ main, euro });
      }
      return draws;
    }, []);
  }

  function renderCharts() {
    renderFrequencyChart("main", elements.mainFrequencyChart);
    renderFrequencyChart("euro", elements.euroFrequencyChart);
  }

  function renderFrequencyChart(type, container) {
    container.innerHTML = "";
    const frequencies =
      type === "main" ? analyzer.mainFrequency : analyzer.euroFrequency;
    const maxFrequency = Math.max(...frequencies.values());

    frequencies.forEach((count, number) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `${(count / maxFrequency) * 100}%`;

      const item = document.createElement("div");
      item.className = "chart-item";
      item.innerHTML = `
              <span class="chart-label">${number
                .toString()
                .padStart(2, "0")}</span>
              <div class="bar-container">
                  ${bar.outerHTML}
              </div>
              <span class="chart-count">${count}</span>
          `;

      container.appendChild(item);
    });
  }

  function renderCombinations(combos) {
    elements.results.innerHTML = combos
      .map(
        (combo) => `
          <div class="combination">
              <div class="strategy-tag ${
                combo.strategy
              }">${combo.strategy.toUpperCase()}</div>
              <div class="numbers">
                  ${combo.main
                    .map((n) => `<span class="number">${n}</span>`)
                    .join("")}
                  ${combo.euro
                    .map((n) => `<span class="number euro-number">${n}</span>`)
                    .join("")}
              </div>
              <small>${new Date(combo.generatedAt).toLocaleString()}</small>
          </div>
      `
      )
      .join("");
  }

  function updateUI() {
    elements.drawCount.textContent = `${currentDraws.length} draws loaded`;
  }

  function addSourceTag(source) {
    const tag = document.createElement("span");
    tag.className = "source-tag";
    tag.textContent = source;
    elements.sourceTags.appendChild(tag);
  }

  function showMessage(text, isError = false) {
    const msg = document.createElement("div");
    msg.className = `message ${isError ? "error" : "success"}`;
    msg.textContent = text;

    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }
});
