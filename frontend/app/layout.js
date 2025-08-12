import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'Math Quiz - Learn & Challenge',
  description: 'Interactive math quiz platform to test and improve your skills',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}