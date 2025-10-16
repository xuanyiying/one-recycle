/**
 * Lazy loaded Settings Page
 * This is a wrapper for code splitting
 */

import { lazyPage } from '../../utils/lazyLoad';

// Lazy load the actual settings page
export default lazyPage(
  () => import('./index'),
  '设置'
);
