import { authService } from './authService';
import { initAdminVisibility } from './adminVisibility';

// Start Supabase auth once for the lifetime of the SPA.
// This restores persisted sessions and handles OAuth redirect sessions.
authService.initAuthListener();
initAdminVisibility();
