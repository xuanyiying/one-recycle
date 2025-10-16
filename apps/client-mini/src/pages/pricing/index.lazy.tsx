/**
 * Lazy loaded Pricing Page
 * This is a wrapper for code splitting
 */

import { lazyPage } from '../../utils/lazyLoad';

// Lazy load the actual pricing page
export default lazyPage(
  () => import('./index'),
  '价格说明'
);
