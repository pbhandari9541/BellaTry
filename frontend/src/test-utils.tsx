import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'

// Custom render function that wraps components with necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Robustly mock supabase.auth.getSession for all tests (Supabase v2.x)
beforeAll(() => {
  if (!('getSession' in supabase.auth)) {
    // @ts-expect-error: Supabase v2.x mock for getSession in test environment
    supabase.auth.getSession = () => Promise.resolve({ data: { session: null }, error: null });
  } else {
    jest.spyOn(supabase.auth, 'getSession').mockImplementation(() =>
      Promise.resolve({ data: { session: null }, error: null })
    );
  }
});

export * from '@testing-library/react'
export { customRender as render } 