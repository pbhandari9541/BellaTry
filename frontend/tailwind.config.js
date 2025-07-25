/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwindcss-animate"),
  ],
  corePlugins: {
    float: false,
    clear: false,
  },
  theme: {
  	screens: {
  		sm: '480px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1536px'
  	},
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				brand: 'var(--primary-brand)',
  				text: 'var(--primary-text)',
  				background: 'var(--primary-background)',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'var(--primary-background-hover)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				brand: 'var(--secondary-brand)',
  				text: 'var(--secondary-text)',
  				background: 'var(--secondary-background)',
  				foreground: 'hsl(var(--secondary-foreground))',
  				hover: 'var(--secondary-background-hover)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  				hover: 'var(--destructive-background-hover)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning)'
  			},
  			success: {
  				DEFAULT: 'var(--success)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			layout: {
  				DEFAULT: 'var(--layout-background)'
  			},
  			component: {
  				DEFAULT: 'var(--component-background)'
  			},
  			surface: {
  				DEFAULT: 'var(--surface-background)'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				background: 'var(--card-background)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			positive: {
  				DEFAULT: 'var(--success)',
  				light: 'var(--success-light)',
  				dark: 'var(--success-dark)'
  			},
  			negative: {
  				DEFAULT: 'var(--destructive)',
  				light: 'var(--destructive-light)',
  				dark: 'var(--destructive-dark)'
  			},
  			neutral: {
  				DEFAULT: 'var(--muted)',
  				light: 'var(--muted-light)',
  				dark: 'var(--muted-dark)'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		spacing: {
  			'128': '32rem'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
} 