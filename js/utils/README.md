# UIHelpers - Core UI Utilities

## Overview

The UIHelpers module provides essential UI utility functions for the RRB Mock Test App, including toast notifications, ID generation, form validation, array manipulation, and performance utilities.

## Quick Start

The UIHelpers class is automatically instantiated and available globally as `window.UIHelpers`.

```javascript
// Toast notifications
UIHelpers.showToast('Success message!', 'success');
UIHelpers.showToast('Error occurred!', 'error');

// ID generation
const uniqueId = UIHelpers.generateUniqueId('question');
const uuid = UIHelpers.generateUUID();

// Form validation
const result = UIHelpers.validateForm(formData, validationRules);

// Array utilities
const shuffled = UIHelpers.shuffleArray(questions);
const grouped = UIHelpers.groupBy(questions, 'subject');
```

## Features

### 🍞 Toast Notification System

Accessible toast notifications with multiple types and auto-dismiss functionality.

```javascript
// Basic usage
UIHelpers.showToast('Message', 'type', duration, dismissible);

// Examples
UIHelpers.showToast('Question saved!', 'success', 3000);
UIHelpers.showToast('Validation failed', 'error', 5000);
UIHelpers.showToast('15 minutes remaining', 'warning', 4000);
UIHelpers.showToast('Tip: Use shortcuts', 'info', 6000);

// Clear all toasts
UIHelpers.clearAllToasts();
```

**Toast Types:**
- `success` - Green with checkmark
- `error` - Red with X
- `warning` - Yellow with warning symbol
- `info` - Blue with info symbol

### 🆔 ID Generation

Collision-resistant unique identifiers for various use cases.

```javascript
// Unique ID with prefix
const sessionId = UIHelpers.generateUniqueId('session');
// Result: "session-abc123-def456-1"

// UUID v4
const testId = UIHelpers.generateUUID();
// Result: "550e8400-e29b-41d4-a716-446655440000"

// Short random ID
const resultId = UIHelpers.generateShortId(8);
// Result: "Ae3Kx9Zm"
```

### 📝 Form Validation

Comprehensive form validation with built-in patterns and custom rules.

```javascript
// Email validation
const isValid = UIHelpers.isValidEmail('user@example.com'); // true

// Phone validation (Indian format)
const isValidPhone = UIHelpers.isValidPhone('9876543210'); // true

// Complex form validation
const validationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, validator: (value) => UIHelpers.isValidPhone(value) }
};

const result = UIHelpers.validateForm(formData, validationRules);
// Result: { isValid: boolean, errors: string[] }
```

### 🔧 Array Utilities

Efficient array manipulation functions.

```javascript
// Shuffle array (Fisher-Yates algorithm)
const shuffled = UIHelpers.shuffleArray([1, 2, 3, 4, 5]);

// Get unique items
const unique = UIHelpers.getUniqueItems(array, 'id');

// Group by property
const grouped = UIHelpers.groupBy(questions, 'subject');

// Chunk into smaller arrays
const chunks = UIHelpers.chunkArray(questions, 10);
```

### ⚡ Performance Utilities

Debounce and throttle functions to optimize performance.

```javascript
// Debounce - delays execution until after wait time
const debouncedSearch = UIHelpers.debounce((term) => {
    performSearch(term);
}, 300, 'search');

// Throttle - limits execution to once per wait time
const throttledSave = UIHelpers.throttle(() => {
    autoSave();
}, 30000, 'auto-save');

// Cancel debounced function
UIHelpers.cancelDebounce('search');
```

### 🛠️ Additional Utilities

Various helper functions for common tasks.

```javascript
// Format file size
const size = UIHelpers.formatFileSize(1024 * 1024); // "1 MB"

// Sanitize HTML
const safe = UIHelpers.sanitizeHTML('<script>alert("xss")</script>'); 

// Escape HTML
const escaped = UIHelpers.escapeHTML('<div>content</div>');

// Copy to clipboard
const success = await UIHelpers.copyToClipboard('text to copy');
```

## Integration with MockTestApp

### Replacing Console Logs with Toast Notifications

In `app.js` line 344, replace:
```javascript
console.log(message);
```

With:
```javascript
// Determine toast type based on message content
let toastType = 'warning';
if (message.includes('15 minutes')) toastType = 'warning';
else if (message.includes('5 minutes')) toastType = 'warning';
else if (message.includes('1 minute')) toastType = 'error';

UIHelpers.showToast(message, toastType, 4000);
```

### Form Validation Integration

```javascript
// In user creation modal
validateUserInput(userData) {
    const rules = {
        name: { required: true, minLength: 2, maxLength: 50 }
    };
    
    const result = UIHelpers.validateForm(userData, rules);
    
    if (!result.isValid) {
        result.errors.forEach(error => {
            UIHelpers.showToast(error, 'error', 5000);
        });
        return false;
    }
    
    UIHelpers.showToast('User created successfully!', 'success');
    return true;
}
```

### Question Management

```javascript
// Shuffle questions for test
generateRandomTest(questions, count) {
    const shuffled = UIHelpers.shuffleArray(questions);
    return shuffled.slice(0, count);
}

// Group questions by subject
getQuestionsBySubject(questions) {
    return UIHelpers.groupBy(questions, 'subject');
}
```

### Auto-Save with Throttling

```javascript
// Throttled auto-save
autoSaveProgress = UIHelpers.throttle(() => {
    this.saveTestSession();
    UIHelpers.showToast('Progress saved', 'info', 2000);
}, 30000, 'auto-save');

// Call on answer selection
onAnswerSelect() {
    this.autoSaveProgress();
}
```

## Styling

Toast notifications are styled through CSS classes in `style.css`. The system supports:

- Responsive design (mobile-friendly)
- Dark theme compatibility
- Accessibility features (ARIA attributes)
- Smooth animations and transitions

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## API Reference

See the JSDoc comments in `UIHelpers.js` for complete API documentation with parameter types, return values, and usage examples.