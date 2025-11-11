import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to dashboard - middleware will handle locale
  redirect('/dashboard');
}
