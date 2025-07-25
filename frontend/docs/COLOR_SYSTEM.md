# TradeAdvisor Color Management System

## Background Hierarchy

Our color system uses a clean, consistent hierarchy for backgrounds across all pages:

### 🎨 **Background Levels**

1. **`bg-background`** - Pure white main background
   - Use for: Main page backgrounds, primary content areas
   - Light: `oklch(1 0 0)` (Pure White)
   - Dark: `oklch(0.147 0.004 49.25)` (Dark Gray)

2. **`bg-layout`** - Pure white layout background
   - Use for: App shell, outer containers
   - Light: `oklch(1 0 0)` (Pure White)
   - Dark: `oklch(0.12 0.004 49.25)` (Darker Gray)

3. **`bg-component`** - Very light gray for components
   - Use for: Component containers, feature sections
   - Light: `oklch(0.98 0 0)` (Very light gray)
   - Dark: `oklch(0.18 0.004 49.25)` (Slightly lighter)

4. **`bg-surface`** - Slightly off-white surface
   - Use for: Secondary content areas, subtle sections
   - Light: `oklch(0.99 0 0)` (Slightly off-white)
   - Dark: `oklch(0.14 0.004 49.25)` (Surface background)

5. **`bg-card-background`** - Card backgrounds
   - Use for: Cards, panels, individual items
   - Light: `oklch(1 0 0)` (Pure white)
   - Dark: `oklch(0.16 0.004 49.25)` (Card background)

## 🔵 **Brand Colors (Blue Theme)**

### **Primary Brand Colors**
- **`bg-primary`** - Primary Blue `oklch(0.55 0.18 264)`
- **`bg-primary-hover`** - Darker Blue `oklch(0.48 0.20 264)`
- **`text-primary`** - Primary blue for links and accents
- **`text-primary-hover`** - Darker blue for hover states

### **Secondary Brand Colors**
- **`bg-secondary`** - Lighter Blue `oklch(0.65 0.15 264)`
- **`text-secondary`** - Secondary blue for less prominent elements

## 🟢🟠🔴 **Status & Sentiment Colors**

### **Positive, Negative, Warning, and Accent**

These semantic colors are used to indicate status, sentiment, or highlight important information in the UI (e.g., for cards, badges, alerts, or table rows):

- **`bg-positive`** / **`text-positive`** — Success, positive sentiment, or "Buy" status
  - Maps to: `var(--success)`
- **`bg-negative`** / **`text-negative`** — Error, negative sentiment, or "Sell" status
  - Maps to: `var(--destructive)`
- **`bg-warning`** / **`text-warning`** — Warning, caution, or "Hold"/"Risk" status
  - Maps to: `var(--warning)`
- **`bg-accent`** / **`text-accent`** — Accent or highlight (e.g., for special info, trending)
  - Maps to: `hsl(var(--accent))`

### **Usage Examples**

```tsx
// Positive sentiment card
<div className="bg-positive text-white p-4 rounded-lg">
  <span className="font-bold">Positive</span> — Market is bullish
</div>

// Negative sentiment badge
<span className="bg-negative text-white px-2 py-1 rounded">Sell</span>

// Warning alert
<div className="bg-warning text-primary-text p-4 rounded-lg">
  <strong>Warning:</strong> High volatility detected
</div>

// Accent highlight
<div className="bg-accent text-white p-2 rounded">Trending</div>
```

**Note:**
- Always use these semantic classes for status/sentiment, not hardcoded colors.
- These colors adapt to light/dark mode automatically.
- If you need a new status/sentiment color, propose it here and in `tailwind.config.js`.

## 📋 **Usage Guidelines**

### ✅ **Recommended Pattern for Pages:**

```tsx
export default function YourPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content on pure white */}
      
      <div className="bg-component rounded-lg p-6">
        {/* Component sections with light gray background */}
        
        <div className="bg-card-background p-4 rounded-lg border border-border">
          {/* Individual cards on pure white */}
        </div>
      </div>
    </div>
  );
}
```

### 🎯 **Text Colors**

- **`text-primary-text`** - Main headings, important text (almost black)
- **`text-foreground`** - Body text, general content (dark gray)
- **`text-secondary-text`** - Subheadings, secondary content (grayish)
- **`text-muted-foreground`** - Descriptions, less important text (muted gray)

### 🎨 **Interactive Elements**

- **Primary Buttons**: `bg-primary hover:bg-primary-hover text-white`
- **Secondary Buttons**: `border border-border text-foreground hover:bg-muted`
- **Links**: `text-primary hover:text-primary-hover`
- **Borders**: `border-border`
- **Focus rings**: `focus:ring-primary`

### 🔵 **Blue Theme Usage Examples**

```tsx
// Primary CTA Button
<button className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors">
  Get Started
</button>

// Navigation Links
<Link href="/dashboard" className="text-primary hover:text-primary-hover font-medium transition-colors">
  Dashboard
</Link>

// Form Focus States
<input className="focus:ring-2 focus:ring-primary border border-border" />
```

## 🔄 **Consistency Rules**

1. **Always use `bg-background`** for main page containers (pure white)
2. **Use `bg-component`** for feature sections (light gray)
3. **Use `bg-card-background`** for individual cards (pure white)
4. **Use primary blue (`bg-primary`)** for primary actions and CTAs
5. **Use `text-primary`** for links and interactive text elements
6. **Maintain clear background hierarchy** - white main background, light gray components
7. **Test in both light and dark modes** - colors automatically adapt

## 🌓 **Dark Mode**

All colors automatically adapt to dark mode using CSS custom properties:
- **Primary Brand**: Slightly brighter `oklch(0.60 0.18 264)` for better contrast
- **Primary Hover**: Adjusted `oklch(0.52 0.20 264)` for dark backgrounds
- **Secondary Brand**: Lighter `oklch(0.70 0.15 264)` for visibility
- **Backgrounds**: Dark grays with proper contrast hierarchy

No need for `dark:` prefixes when using the theme system.

## 🚫 **Avoid**

- Hardcoded colors like `bg-blue-600`, `bg-gray-100`, etc.
- Using background colors that break the white → light gray hierarchy
- Mixing theme colors with Tailwind default colors
- Using `dark:` prefixes when theme colors are available
- Adding any tints or hues to background colors (keep them neutral)

## ✨ **Examples**

```tsx
// ✅ Good - Clean hierarchy with proper backgrounds
<div className="min-h-screen bg-background">
  <div className="bg-component p-6">
    <div className="bg-card-background p-4 border border-border">
      <h3 className="text-primary-text">Card Title</h3>
      <p className="text-muted-foreground">Description</p>
      <button className="bg-primary hover:bg-primary-hover text-white">
        Action
      </button>
    </div>
  </div>
</div>

// ❌ Bad - Mixed systems and incorrect backgrounds
<div className="min-h-screen bg-gray-50">
  <div className="bg-white/80">
    <button className="bg-blue-600 hover:bg-blue-700">
      // Inconsistent with theme
    </button>
  </div>
</div>
```

## 🎨 **Color Palette Summary**

### **Backgrounds (Light → Dark)**
- `bg-background`: Pure White → Dark Gray
- `bg-layout`: Pure White → Darker Gray
- `bg-component`: Light Gray → Component Gray
- `bg-surface`: Off-white → Surface Gray
- `bg-card-background`: Pure White → Card Gray

### **Brand Colors**
- `bg-primary`: Primary Blue → Brighter Blue
- `text-primary`: Primary Blue → Brighter Blue
- `bg-primary-hover`: Darker Blue → Adjusted Dark Blue

### **Text Colors**
- `text-primary-text`: Almost Black → Soft White
- `text-foreground`: Dark Gray → White
- `text-secondary-text`: Grayish → Muted Gray
- `text-muted-foreground`: Muted Gray → Muted Light

This system ensures consistent, accessible, and maintainable design with clean background hierarchy across your entire application! 🔵

## 🧑‍💻 AI/Contributor Color System Instructions

1. **Always use only the semantic Tailwind classes defined in `tailwind.config.js` and documented in this file.**
2. **Never use hardcoded Tailwind default colors** (e.g., `bg-blue-600`, `bg-white`, `text-blue-600`, etc.).
3. **For backgrounds:**  Use `bg-background`, `bg-layout`, `bg-component`, `bg-card-background`, etc.
4. **For brand/interactive elements:**  Use `bg-primary`, `hover:bg-primary-hover`, `text-primary`, `text-success`, `text-destructive`, etc.
5. **For text:**  Use `text-primary-text`, `text-foreground`, `text-muted-foreground`, etc.
6. **For borders:**  Use `border-border`.
7. **For focus states:**  Use `focus:ring-primary`.
8. **If a needed color or style is missing, suggest an addition to the color system, do not use a default Tailwind color.**
9. **Review all new/changed code for color compliance before submitting a PR.**

_This ensures all UI is consistent, themeable, and easy to maintain. If in doubt, consult this file or ask for a review before merging._ 