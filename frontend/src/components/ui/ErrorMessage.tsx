import React from 'react';

interface ErrorMessageProps {
  message: string;
  children?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, children }) => (
  <div className="bg-destructive text-destructive-foreground p-4 rounded my-2 flex flex-col gap-2">
    <span className="font-semibold">{message}</span>
    {children && <div className="text-xs text-muted-foreground">{children}</div>}
  </div>
);

export default ErrorMessage; 