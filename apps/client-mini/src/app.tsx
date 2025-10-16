import { Component, PropsWithChildren } from 'react'
import { AppProvider } from './store'
import { setupNavigationPreload, preloadCriticalPages } from './utils/preloadPages'
import { performanceMonitor } from './utils/performanceMonitor'
import networkStatusManager from './utils/networkStatus'
import OfflineIndicator from './components/OfflineIndicator'
import './styles/global.scss' // 引入全局样式
import './app.scss'

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
                <OfflineIndicator />
                {this.props.children}
            </AppProvider>
        )
    }
}

export default App