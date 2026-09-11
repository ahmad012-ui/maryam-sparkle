import { authService } from './authService';

// Start the Supabase auth listener once for the lifetime of the SPA.
// This restores persisted sessions on refresh and handles OAuth redirects.
authService.initAuthListener();
