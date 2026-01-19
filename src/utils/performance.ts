/**
 * 性能监控工具
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  /**
   * 开始计时
   */
  start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: Date.now(),
    });
  }

  /**
   * 结束计时
   */
  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    return metric.duration;
  }

  /**
   * 获取指标
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
