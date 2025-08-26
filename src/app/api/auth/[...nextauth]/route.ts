import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Make sure it imports from the new '/lib/auth' file

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
