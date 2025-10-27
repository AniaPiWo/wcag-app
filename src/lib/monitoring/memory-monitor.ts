/**
 * Memory Monitor - Narzędzie do monitorowania zużycia RAM
 */

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface MemoryReport {
  startSnapshot: MemorySnapshot;
  endSnapshot: MemorySnapshot;
  peakSnapshot: MemorySnapshot;
  duration: number;
  heapUsedDelta: number;
  rssDelta: number;
  peakHeapUsed: number;
  peakRss: number;
}

export class MemoryMonitor {
  private startSnapshot: MemorySnapshot | null = null;
  private peakSnapshot: MemorySnapshot | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private snapshots: MemorySnapshot[] = [];

  /**
   * Rozpoczyna monitorowanie pamięci
   */
  start(): void {
    this.startSnapshot = this.takeSnapshot();
    this.peakSnapshot = this.startSnapshot;
    this.snapshots = [this.startSnapshot];

    // Monitoruj co 100ms
    this.intervalId = setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.snapshots.push(snapshot);

      // Aktualizuj peak jeśli większe zużycie
      if (this.peakSnapshot && snapshot.heapUsed > this.peakSnapshot.heapUsed) {
        this.peakSnapshot = snapshot;
      }
    }, 100);
  }

  /**
   * Zatrzymuje monitorowanie i zwraca raport
   */
  stop(): MemoryReport | null {
    if (!this.startSnapshot) {
      console.error('MemoryMonitor: nie uruchomiono monitorowania');
      return null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const endSnapshot = this.takeSnapshot();
    const duration = endSnapshot.timestamp - this.startSnapshot.timestamp;

    const report: MemoryReport = {
      startSnapshot: this.startSnapshot,
      endSnapshot,
      peakSnapshot: this.peakSnapshot || endSnapshot,
      duration,
      heapUsedDelta: endSnapshot.heapUsed - this.startSnapshot.heapUsed,
      rssDelta: endSnapshot.rss - this.startSnapshot.rss,
      peakHeapUsed: this.peakSnapshot?.heapUsed || endSnapshot.heapUsed,
      peakRss: this.peakSnapshot?.rss || endSnapshot.rss,
    };

    // Reset
    this.startSnapshot = null;
    this.peakSnapshot = null;
    this.snapshots = [];

    return report;
  }

  /**
   * Pobiera snapshot pamięci
   */
  private takeSnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();
    return {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers,
    };
  }

  /**
   * Formatuje bajty do czytelnego formatu
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Formatuje raport do czytelnej formy
   */
  static formatReport(report: MemoryReport): string {
    const lines = [
      '=== Memory Report ===',
      `Duration: ${report.duration}ms`,
      '',
      'Start:',
      `  Heap Used: ${this.formatBytes(report.startSnapshot.heapUsed)}`,
      `  RSS: ${this.formatBytes(report.startSnapshot.rss)}`,
      '',
      'End:',
      `  Heap Used: ${this.formatBytes(report.endSnapshot.heapUsed)}`,
      `  RSS: ${this.formatBytes(report.endSnapshot.rss)}`,
      '',
      'Peak:',
      `  Heap Used: ${this.formatBytes(report.peakHeapUsed)}`,
      `  RSS: ${this.formatBytes(report.peakRss)}`,
      '',
      'Delta:',
      `  Heap Used: ${this.formatBytes(report.heapUsedDelta)} (${report.heapUsedDelta > 0 ? '+' : ''}${((report.heapUsedDelta / report.startSnapshot.heapUsed) * 100).toFixed(2)}%)`,
      `  RSS: ${this.formatBytes(report.rssDelta)} (${report.rssDelta > 0 ? '+' : ''}${((report.rssDelta / report.startSnapshot.rss) * 100).toFixed(2)}%)`,
      '===================='
    ];
    return lines.join('\n');
  }

  /**
   * Zapisuje raport do pliku
   */
  static async saveReport(report: MemoryReport, filename: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const reportPath = path.join(process.cwd(), 'memory-reports', filename);
    const reportDir = path.dirname(reportPath);
    
    // Utwórz katalog jeśli nie istnieje
    await fs.mkdir(reportDir, { recursive: true });
    
    const content = {
      timestamp: new Date().toISOString(),
      report,
      formatted: this.formatReport(report)
    };
    
    await fs.writeFile(reportPath, JSON.stringify(content, null, 2));
    console.log(`Memory report saved to: ${reportPath}`);
  }
}

/**
 * Helper function - monitoruj funkcję async
 */
export async function monitorMemory<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; report: MemoryReport }> {
  const monitor = new MemoryMonitor();
  
  console.log(`[MemoryMonitor] Starting: ${label || 'unnamed function'}`);
  monitor.start();
  
  try {
    const result = await fn();
    const report = monitor.stop();
    
    if (report) {
      console.log(`[MemoryMonitor] Completed: ${label || 'unnamed function'}`);
      console.log(MemoryMonitor.formatReport(report));
    }
    
    return { result, report: report! };
  } catch (error) {
    const report = monitor.stop();
    if (report) {
      console.log(`[MemoryMonitor] Failed: ${label || 'unnamed function'}`);
      console.log(MemoryMonitor.formatReport(report));
    }
    throw error;
  }
}
