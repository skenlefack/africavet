import { redirect } from 'next/navigation';

// Server component that redirects to the default language
// The middleware handles language detection and redirects appropriately
export default function RootPage() {
  // Redirect to French by default - middleware will handle language detection
  redirect('/fr');
}
