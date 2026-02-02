import { Component, PropsWithChildren, lazy, Suspense } from 'react'
import { AppProvider } from './store'
import { AddressData } from './services/address-data'
import { performanceMonitor } from './utils/performanceMonitor'
import networkStatusManager from './utils/networkStatus'
import './styles/global.scss' // 引入全局样式
import './app.scss'

// 导入mock系统以确保路由被正确注册
import './mock'
import { MockAutoLogin } from './mock'

// Lazy load non-critical components
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator'))

class App extends Component<PropsWithChildren> {
    private performanceInterval?: ReturnType<typeof setInterval>;

    async componentDidMount() {
        // Initialize network status monitoring
        await networkStatusManager.initialize();

        // Initialize mock auto login in development
        if (process.env.NODE_ENV === 'development') {
             await MockAutoLogin.initialize();
        }

        // Preload critical pages after a short delay
        setTimeout(() => {
            // Preload core address data
            AddressData.preloadCoreProvinces();
        }, 2000);

        // Send performance metrics every 5 minutes in production
        if (process.env.NODE_ENV === 'production') {
            this.performanceInterval = setInterval(() => {
                performanceMonitor.sendToAnalytics();
            }, 5 * 60 * 1000);
        }
    }
    componentWillUnmount() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
    }
    // this.props.children 是将要会渲染的页面
    render() {
        return (
            <AppProvider>
                <Suspense fallback={<div>Loading...</div>}>
                    <OfflineIndicator />
                </Suspense>
                {this.props.children}
            </AppProvider>
        )
    }
}

export default App