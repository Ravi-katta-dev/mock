/**
 * PerformanceMonitor - Performance Tracking and Monitoring Utility
 * 
 * This utility provides comprehensive performance monitoring, metrics collection,
 * and optimization suggestions for the RRB Mock Test Application.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class PerformanceMonitor {
    constructor() {
        this.initialized = false;
        this.metrics = {
            pageLoad: {},
            userInteractions: [],
            memoryUsage: [],
            networkRequests: [],
            renderTimes: []
        };
        this.thresholds = {
            slowInteraction: 100, // ms
            highMemoryUsage: 50 * 1024 * 1024, // 50MB
            slowNetworkRequest: 3000, // 3 seconds
            slowRender: 16 // ms (60fps = ~16ms per frame)
        };
        this.observers = {};
        this.monitoringInterval = null;
    }

    /**
     * Initialize the Performance Monitor
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Performance Monitor...');
        
        this.setupPerformanceObservers();
        this.startContinuousMonitoring();
        this.measurePageLoad();
        this.setupUserInteractionTracking();
        
        this.initialized = true;
        console.log('Performance Monitor initialized successfully');
    }

    /**
     * Setup Performance API observers
     */
    setupPerformanceObservers() {
        // Navigation timing observer
        if ('PerformanceObserver' in window) {
            try {
                // Observer for navigation timing
                this.observers.navigation = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            this.recordNavigationTiming(entry);
                        }
                    });
                });
                this.observers.navigation.observe({ entryTypes: ['navigation'] });

                // Observer for resource timing
                this.observers.resource = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordResourceTiming(entry);
                    });
                });
                this.observers.resource.observe({ entryTypes: ['resource'] });

                // Observer for paint timing
                this.observers.paint = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordPaintTiming(entry);
                    });
                });
                this.observers.paint.observe({ entryTypes: ['paint'] });

                // Observer for largest contentful paint
                if ('largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
                    this.observers.lcp = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            this.recordLCP(entry);
                        });
                    });
                    this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
                }

                // Observer for cumulative layout shift
                if ('layout-shift' in PerformanceObserver.supportedEntryTypes) {
                    this.observers.cls = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        entries.forEach(entry => {
                            this.recordCLS(entry);
                        });
                    });
                    this.observers.cls.observe({ entryTypes: ['layout-shift'] });
                }
            } catch (error) {
                console.warn('Could not setup performance observers:', error);
            }
        }
    }

    /**
     * Start continuous monitoring
     */
    startContinuousMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.recordMemoryUsage();
            this.checkPerformanceThresholds();
        }, 10000); // Every 10 seconds
    }

    /**
     * Measure initial page load performance
     */
    measurePageLoad() {
        if ('performance' in window && 'timing' in performance) {
            const timing = performance.timing;
            const navigation = performance.navigation;
            
            this.metrics.pageLoad = {
                navigationStart: timing.navigationStart,
                domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
                serverConnect: timing.connectEnd - timing.connectStart,
                serverResponse: timing.responseEnd - timing.requestStart,
                domParsing: timing.domComplete - timing.domLoading,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                windowLoad: timing.loadEventEnd - timing.navigationStart,
                redirectCount: navigation.redirectCount,
                navigationType: navigation.type,
                timestamp: Date.now()
            };
            
            // Log performance warnings
            this.checkPageLoadPerformance();
        }
    }

    /**
     * Setup user interaction tracking
     */
    setupUserInteractionTracking() {
        const interactionEvents = ['click', 'keydown', 'scroll', 'input'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.recordUserInteraction(eventType, event);
            }, { passive: true });
        });
    }

    /**
     * Record navigation timing
     */
    recordNavigationTiming(entry) {
        this.metrics.pageLoad.navigationTiming = {
            domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
            connectionTime: entry.connectEnd - entry.connectStart,
            requestTime: entry.responseEnd - entry.requestStart,
            domProcessingTime: entry.domComplete - entry.domLoading,
            loadCompleteTime: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.navigationStart
        };
    }

    /**
     * Record resource timing
     */
    recordResourceTiming(entry) {
        const resourceMetric = {
            name: entry.name,
            type: this.getResourceType(entry.name),
            duration: entry.duration,
            size: entry.transferSize || 0,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
            timestamp: Date.now()
        };
        
        this.metrics.networkRequests.push(resourceMetric);
        
        // Keep only last 100 requests
        if (this.metrics.networkRequests.length > 100) {
            this.metrics.networkRequests = this.metrics.networkRequests.slice(-100);
        }
        
        // Check for slow requests
        if (entry.duration > this.thresholds.slowNetworkRequest) {
            this.reportSlowResource(resourceMetric);
        }
    }

    /**
     * Record paint timing
     */
    recordPaintTiming(entry) {
        this.metrics.pageLoad[entry.name] = entry.startTime;
    }

    /**
     * Record Largest Contentful Paint
     */
    recordLCP(entry) {
        this.metrics.pageLoad.largestContentfulPaint = entry.startTime;
        
        // LCP should be under 2.5 seconds for good user experience
        if (entry.startTime > 2500) {
            this.reportPerformanceIssue('slow-lcp', `LCP is ${entry.startTime.toFixed(0)}ms`);
        }
    }

    /**
     * Record Cumulative Layout Shift
     */
    recordCLS(entry) {
        if (!this.metrics.pageLoad.cumulativeLayoutShift) {
            this.metrics.pageLoad.cumulativeLayoutShift = 0;
        }
        this.metrics.pageLoad.cumulativeLayoutShift += entry.value;
        
        // CLS should be under 0.1 for good user experience
        if (this.metrics.pageLoad.cumulativeLayoutShift > 0.1) {
            this.reportPerformanceIssue('high-cls', `CLS is ${this.metrics.pageLoad.cumulativeLayoutShift.toFixed(3)}`);
        }
    }

    /**
     * Record user interaction
     */
    recordUserInteraction(type, event) {
        const startTime = performance.now();
        
        // Use requestAnimationFrame to measure interaction response time
        requestAnimationFrame(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const interaction = {
                type,
                target: event.target.tagName + (event.target.id ? `#${event.target.id}` : ''),
                duration,
                timestamp: Date.now()
            };
            
            this.metrics.userInteractions.push(interaction);
            
            // Keep only last 50 interactions
            if (this.metrics.userInteractions.length > 50) {
                this.metrics.userInteractions = this.metrics.userInteractions.slice(-50);
            }
            
            // Check for slow interactions
            if (duration > this.thresholds.slowInteraction) {
                this.reportSlowInteraction(interaction);
            }
        });
    }

    /**
     * Record memory usage
     */
    recordMemoryUsage() {
        if ('memory' in performance) {
            const memoryInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
            
            this.metrics.memoryUsage.push(memoryInfo);
            
            // Keep only last 100 measurements
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
            }
            
            // Check for high memory usage
            if (memoryInfo.used > this.thresholds.highMemoryUsage) {
                this.reportHighMemoryUsage(memoryInfo);
            }
        }
    }

    /**
     * Check page load performance
     */
    checkPageLoadPerformance() {
        const { pageLoad } = this.metrics;
        
        if (pageLoad.domContentLoaded > 3000) {
            this.reportPerformanceIssue('slow-dom-load', `DOM loaded in ${pageLoad.domContentLoaded}ms`);
        }
        
        if (pageLoad.windowLoad > 5000) {
            this.reportPerformanceIssue('slow-page-load', `Page loaded in ${pageLoad.windowLoad}ms`);
        }
    }

    /**
     * Check performance thresholds
     */
    checkPerformanceThresholds() {
        // Check recent interactions for performance issues
        const recentInteractions = this.metrics.userInteractions.slice(-10);
        const slowInteractions = recentInteractions.filter(i => i.duration > this.thresholds.slowInteraction);
        
        if (slowInteractions.length > 3) {
            this.reportPerformanceIssue('frequent-slow-interactions', 'Multiple slow interactions detected');
        }
        
        // Check memory trend
        if (this.metrics.memoryUsage.length >= 5) {
            const recent = this.metrics.memoryUsage.slice(-5);
            const increasing = recent.every((curr, i) => i === 0 || curr.used > recent[i - 1].used);
            
            if (increasing) {
                this.reportPerformanceIssue('memory-leak-suspected', 'Memory usage is consistently increasing');
            }
        }
    }

    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.includes('.js')) return 'script';
        if (url.includes('.css')) return 'stylesheet';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
        if (url.includes('.pdf')) return 'document';
        return 'other';
    }

    /**
     * Report performance issues
     */
    reportPerformanceIssue(type, message) {
        if (window.ErrorHandler) {
            window.ErrorHandler.handleError({
                message: `Performance Issue: ${message}`,
                category: window.ErrorHandler.categories.PERFORMANCE,
                severity: window.ErrorHandler.severity.LOW,
                additionalInfo: { performanceType: type }
            });
        } else {
            console.warn(`Performance Issue [${type}]:`, message);
        }
    }

    /**
     * Report slow resource loading
     */
    reportSlowResource(resource) {
        this.reportPerformanceIssue('slow-resource', `${resource.name} took ${resource.duration.toFixed(0)}ms to load`);
    }

    /**
     * Report slow interaction
     */
    reportSlowInteraction(interaction) {
        this.reportPerformanceIssue('slow-interaction', `${interaction.type} on ${interaction.target} took ${interaction.duration.toFixed(0)}ms`);
    }

    /**
     * Report high memory usage
     */
    reportHighMemoryUsage(memoryInfo) {
        const usageMB = (memoryInfo.used / 1024 / 1024).toFixed(1);
        this.reportPerformanceIssue('high-memory', `Memory usage: ${usageMB}MB`);
    }

    /**
     * Mark performance milestone
     */
    mark(name) {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(name);
        }
    }

    /**
     * Measure performance between marks
     */
    measure(name, startMark, endMark) {
        if ('performance' in window && 'measure' in performance) {
            try {
                performance.measure(name, startMark, endMark);
                return performance.getEntriesByName(name, 'measure')[0]?.duration;
            } catch (error) {
                console.warn('Could not measure performance:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            currentMemory: 'memory' in performance ? {
                used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
                total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
                limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) + 'MB'
            } : null
        };
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const metrics = this.getMetrics();
        
        return {
            pageLoad: {
                domContentLoaded: metrics.pageLoad.domContentLoaded || 'N/A',
                windowLoad: metrics.pageLoad.windowLoad || 'N/A',
                firstPaint: metrics.pageLoad['first-paint'] || 'N/A',
                firstContentfulPaint: metrics.pageLoad['first-contentful-paint'] || 'N/A',
                largestContentfulPaint: metrics.pageLoad.largestContentfulPaint || 'N/A'
            },
            interactions: {
                total: metrics.userInteractions.length,
                averageResponseTime: this.calculateAverageInteractionTime(),
                slowInteractions: metrics.userInteractions.filter(i => i.duration > this.thresholds.slowInteraction).length
            },
            network: {
                totalRequests: metrics.networkRequests.length,
                slowRequests: metrics.networkRequests.filter(r => r.duration > this.thresholds.slowNetworkRequest).length,
                averageRequestTime: this.calculateAverageRequestTime()
            },
            memory: metrics.currentMemory
        };
    }

    /**
     * Calculate average interaction time
     */
    calculateAverageInteractionTime() {
        if (this.metrics.userInteractions.length === 0) return 0;
        
        const total = this.metrics.userInteractions.reduce((sum, interaction) => sum + interaction.duration, 0);
        return (total / this.metrics.userInteractions.length).toFixed(1);
    }

    /**
     * Calculate average request time
     */
    calculateAverageRequestTime() {
        if (this.metrics.networkRequests.length === 0) return 0;
        
        const total = this.metrics.networkRequests.reduce((sum, request) => sum + request.duration, 0);
        return (total / this.metrics.networkRequests.length).toFixed(1);
    }

    /**
     * Clear metrics
     */
    clearMetrics() {
        this.metrics = {
            pageLoad: {},
            userInteractions: [],
            memoryUsage: [],
            networkRequests: [],
            renderTimes: []
        };
    }

    /**
     * Stop monitoring
     */
    stop() {
        // Disconnect observers
        Object.values(this.observers).forEach(observer => {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn('Error disconnecting observer:', error);
            }
        });
        
        // Clear monitoring interval
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.initialized = false;
        console.log('Performance monitoring stopped');
    }
}

// Make PerformanceMonitor available globally
window.PerformanceMonitor = new PerformanceMonitor();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}