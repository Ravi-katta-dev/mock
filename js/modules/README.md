# UI Components and Integration Module

This directory contains the modular UI components and integration files for the RRB Mock Test Application.

## Architecture Overview

The application now follows a modular architecture with clear separation of concerns:

```
js/
├── modules/
│   └── UIManager.js          # Comprehensive UI management system
├── config/
│   ├── constants.js          # Application constants
│   ├── syllabusMapping.js    # Subject and syllabus mapping
│   └── examPatterns.js       # Exam pattern configurations
└── app.js                    # Main application integration

css/
├── test-interface.css        # Test interface specific styling
├── dashboard.css             # Dashboard specific styling
└── style.css                 # Base application styles
```

## Modules

### UIManager.js
Comprehensive UI management system that handles:
- **Responsive Design**: Automatic adaptation to different screen sizes
- **Theme Management**: Light/dark theme support with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Mobile Navigation**: Touch-friendly interface with gesture support
- **Keyboard Navigation**: Full keyboard accessibility with shortcuts
- **Focus Management**: Proper focus trapping and management
- **Modal System**: Accessible modal dialogs with proper ARIA
- **Notification System**: Toast notifications with proper announcements
- **Touch Gestures**: Swipe navigation for mobile devices

### CSS Modules

#### test-interface.css
- Complete test interface styling
- Responsive question layout
- Progress indicators and timers
- Question palette with search functionality
- Confidence level selectors
- Mobile-optimized touch targets
- Dark theme support
- Print styles for test results

#### dashboard.css
- Statistics cards with hover effects
- Quick action buttons
- Performance charts containers
- Recent activity timeline
- Study streak indicators
- Responsive grid layouts
- Animation support with reduced motion respect

## Features

### Responsive Design
- **Mobile First**: Optimized for mobile devices with progressive enhancement
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Flexible Layouts**: CSS Grid and Flexbox for adaptive layouts

### Accessibility
- **WCAG 2.1 AA Compliance**: Meets accessibility guidelines
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators and proper tab order
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user preference for reduced motion
- **Skip Links**: Quick navigation for screen reader users

### Theme System
- **Light/Dark Themes**: Complete theme switching capability
- **System Preference**: Automatic detection of system theme preference
- **Persistent Storage**: Theme preference saved across sessions
- **CSS Custom Properties**: Efficient theme switching using CSS variables

### Mobile Optimization
- **Touch Gestures**: Swipe navigation for test questions
- **Mobile Menu**: Collapsible navigation with hamburger menu
- **Viewport Adaptation**: Dynamic viewport height support
- **Touch-Friendly**: Large touch targets and optimized spacing

### Performance
- **Modular Loading**: Components loaded only when needed
- **Memory Management**: Proper cleanup and garbage collection
- **Efficient Rendering**: Optimized DOM updates and reflows
- **Lazy Loading**: Large datasets handled with pagination

## Usage

### Basic Integration
```javascript
// Initialize UI Manager
const uiManager = new UIManager(app);

// Switch sections
uiManager.switchSection('dashboard');

// Show notifications
uiManager.showNotification('Test completed!', 'success');

// Show modals
uiManager.showModal('userModal', {
    focus: true,
    announcement: 'User dialog opened'
});
```

### Theme Management
```javascript
// Toggle theme
uiManager.toggleTheme();

// Apply specific theme
uiManager.applyTheme('dark');

// Get current theme
const currentTheme = uiManager.currentTheme;
```

### Responsive Handling
```javascript
// The UI Manager automatically handles responsive design
// Custom responsive logic can be added:
uiManager.handleResize(); // Manual trigger
```

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Development

### CSS Custom Properties
The application uses CSS custom properties for theming:

```css
:root {
    --color-primary: #218d8d;
    --color-background: #fcfcf9;
    --color-text: #133c3b;
    /* ... */
}

[data-theme="dark"] {
    --color-background: #262828;
    --color-text: #fcfcf9;
    /* ... */
}
```

### Adding New Components
1. Create component styles in appropriate CSS file
2. Add component logic to UIManager if needed
3. Update main app.js integration
4. Add accessibility attributes
5. Test responsive behavior
6. Test keyboard navigation

### Testing
- **Manual Testing**: Test all interactive elements
- **Responsive Testing**: Test on different screen sizes
- **Accessibility Testing**: Use screen readers and keyboard only
- **Theme Testing**: Test both light and dark themes
- **Performance Testing**: Monitor memory usage and rendering

## Best Practices

1. **Accessibility First**: Always consider accessibility from the start
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Progressive Enhancement**: Ensure basic functionality without JavaScript
4. **Semantic HTML**: Use proper HTML elements and ARIA labels
5. **Performance**: Minimize DOM manipulations and optimize rendering
6. **User Preferences**: Respect user settings for motion, contrast, etc.

## Future Enhancements

- **Component Library**: Extract reusable UI components
- **Advanced Animations**: Add more sophisticated animations with performance optimization
- **Offline Support**: Service worker for offline functionality
- **PWA Features**: Add Progressive Web App capabilities
- **Advanced Themes**: Support for custom color themes
- **Internationalization**: Multi-language support