import { Component, PropsWithChildren, lazy, Suspense } from 'react'
import { AppProvider } from './store'
import { setupNavigationPreload, preloadCriticalPages } from './utils/preloadPages'
import { performanceMonitor } from './utils/performanceMonitor'
import networkStatusManager from './utils/networkStatus'
import './styles/global.scss' // 引入全局样式
import './app.scss'

// 导入mock系统以确保路由被正确注册
import './mock'

// Lazy load non-critical components
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator'))
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard'))

class App extends Component<PropsWithChildren> {
    private performanceInterval?: ReturnType<typeof setInterval>;

    componentDidMount() {
        // Initialize network status monitoring
        networkStatusManager.initialize();

        // Setup navigation-based preloading
        setupNavigationPreload();
        
        // Preload critical pages after a short delay
        setTimeout(() => {
            preloadCriticalPages();
        }, 2000);

        // Send performance metrics every 5 minutes in production
        if (process.env.NODE_ENV === 'production') {
            this.performanceInterval = setInterval(() => {
                performanceMonitor.sendToAnalytics();
            }, 5 * 60 * 1000);
        }
    }

    componentDidShow() { }

    componentDidHide() { }

    componentWillUnmount() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
    }

    componentDidCatchError() { }

    // this.props.children 是将要会渲染的页面
    render() {
        return (
            <AppProvider>
                <Suspense fallback={<div>Loading...</div>}>
                    <OfflineIndicator />
                    {process.env.NODE_ENV === 'development' && (
                        <PerformanceDashboard />
                    )}
                </Suspense>
                {this.props.children}
            </AppProvider>
        )
    }
}

export default App