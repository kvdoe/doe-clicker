const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatDoe(n: number): string {
  if (n < 1000) return Math.floor(n).toLocaleString();
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  const suffix = SUFFIXES[Math.min(tier, SUFFIXES.length - 1)];
  const scaled = n / Math.pow(1000, Math.min(tier, SUFFIXES.length - 1));
  return scaled.toFixed(2) + ' ' + suffix;
}

export function formatDoeExact(n: number): string {
  return Math.floor(n).toLocaleString();
}

export function formatDps(n: number): string {
  if (n < 1) return n.toFixed(2);
  if (n < 1000) return n.toFixed(1);
  return formatDoe(n);
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function conduitCost(baseCost: number, owned: number): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned));
}

export function conduitCostBulk(baseCost: number, owned: number, qty: number): number {
  let total = 0;
  for (let i = 0; i < qty; i++) {
    total += conduitCost(baseCost, owned + i);
  }
  return total;
}

export function maxAffordable(baseCost: number, owned: number, doe: number): number {
  let n = 0;
  let total = 0;
  while (true) {
    const next = conduitCost(baseCost, owned + n);
    if (total + next > doe) break;
    total += next;
    n++;
    if (n > 1000) break;
  }
  return n;
}
