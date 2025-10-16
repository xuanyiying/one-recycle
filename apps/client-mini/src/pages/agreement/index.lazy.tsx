/**
 * Lazy loaded Agreement Page
 * This is a wrapper for code splitting
 */

import { lazyPage } from '../../utils/lazyLoad';

// Lazy load the actual agreement page
export default lazyPage(
  () => import('./index'),
  '用户协议'
);
