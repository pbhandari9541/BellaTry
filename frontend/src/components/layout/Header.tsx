"use client";

import React, { useState, useEffect } from 'react';
import { Link } from '@/components/ui/Link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/auth/LogoutButton';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ThemeToggler from './ThemeToggler';
import { Button } from '../ui/Button';

interface HeaderProps {
  locale: string;
}

const navLinks = [
  { name: 'Home', path: '' },
];

const Header: React.FC<HeaderProps> = ({ locale }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(null);
    }
  }, [user, showAuthModal]);

  const isActiveLink = (path: string) => {
    const fullPath = `/${locale}/${path}`.replace(/\/$/, '');
    return pathname === fullPath || (path === '' && pathname === `/${locale}`);
  };

  const handleAuthClick = (type: 'login' | 'signup') => {
    setShowAuthModal(type);
    setMenuOpen(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(null);
  };

  return (
    <>
      <header className="w-full py-4 px-6 bg-layout shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="font-bold text-xl text-primary">
            <Link href={`/${locale}`} variant="primary" className="hover:text-primary-hover transition-colors">
              BellaTry
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={`/${locale}/${link.path}`.replace(/\/$/, '')}
                variant={isActiveLink(link.path) ? 'primary' : 'muted'}
                className={`font-medium transition-colors ${isActiveLink(link.path) ? 'border-b-2 border-primary' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth + ThemeToggler Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-foreground">
                  Welcome, {user.email?.split('@')[0]}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAuthClick('login')}
                  variant="link"
                  className="font-medium"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleAuthClick('signup')}
                  variant="primary"
                  className="font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            )}
            <ThemeToggler />
          </div>

          {/* Mobile Menu Button + ThemeToggler */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggler />
            <button
              className="text-foreground focus:outline-none p-2"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-background bg-opacity-60 z-40"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu overlay"
            />
            {/* Side Drawer */}
            <div
              className="fixed top-0 right-0 h-full w-72 max-w-full bg-layout shadow-lg border-l border-border z-50 flex flex-col transition-transform duration-300 transform translate-x-0"
              style={{ minWidth: '16rem' }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-bold text-lg text-primary">Menu</span>
                <Button
                  onClick={() => setMenuOpen(false)}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground p-2"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <nav className="flex flex-col flex-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={`/${locale}/${link.path}`.replace(/\/$/, '')}
                    variant={isActiveLink(link.path) ? 'primary' : 'muted'}
                    className={`px-6 py-4 border-b border-border font-medium transition-colors ${isActiveLink(link.path) ? 'bg-component' : 'hover:bg-component'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Mobile Auth Section */}
                <div className="px-6 py-4 border-t border-border">
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="text-sm text-foreground">
                        Welcome, {user.email?.split('@')[0]}
                      </div>
                      <LogoutButton />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAuthClick('login')}
                        variant="link"
                        fullWidth
                        className="text-left font-medium"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => handleAuthClick('signup')}
                        variant="primary"
                        fullWidth
                        className="font-semibold"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Auth Modals */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-background rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary-text">
                {showAuthModal === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <Button
                onClick={closeAuthModal}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground p-2"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            {showAuthModal === 'login' ? (
              <LoginForm />
            ) : (
              <SignupForm />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 