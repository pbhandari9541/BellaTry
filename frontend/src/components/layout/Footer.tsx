import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 bg-layout border-t border-border text-center text-sm text-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-2">
        <div>&copy; {new Date().getFullYear()} BellaTry. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="/about" className="text-primary hover:text-primary-hover transition-colors">About</a>
          <a href="/privacy" className="text-primary hover:text-primary-hover transition-colors">Privacy</a>
          <a href="/terms" className="text-primary hover:text-primary-hover transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 