export { default } from 'next-auth/middleware';

// This specifies which routes to protect.
// We are protecting the entire dashboard and all its sub-pages.
export const config = { matcher: ['/dashboard/:path*'] };
