# RRB Technician Grade-3 Signal Mock Test App

A comprehensive web-based mock test application with PDF question extraction capabilities for RRB Technician Grade-3 Signal exam preparation.

![Mock Test App Screenshot](https://via.placeholder.com/800x400/1FB8CD/FFFFFF?text=Mock+Test+App)

## 🚀 Features

### Core Functionality
- ✅ **User Profile Management** - Create and manage user profiles
- ✅ **Question Bank Management** - Add, edit, and organize questions
- ✅ **Multiple Test Types** - Full Mock, Subject-wise, Custom, and PYQ tests
- ✅ **Real-time Test Interface** - Timer, navigation, and question palette
- ✅ **Comprehensive Analytics** - Performance tracking with interactive charts
- ✅ **Test Review System** - Detailed answer explanations and analysis

### 🔥 Enhanced PDF Features
- ✅ **PDF Upload** - Drag-and-drop interface for question bank uploads
- ✅ **Smart Question Extraction** - Multiple parsing strategies to extract questions
- ✅ **Built-in PDF Viewer** - View study materials with zoom and navigation
- ✅ **Question Validation** - Prevents malformed questions with advanced validation
- ✅ **Study Materials Management** - Organize and access PDF documents

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PDF Processing**: PDF.js library
- **Charts**: Chart.js library
- **Storage**: localStorage (client-side)
- **Design**: Responsive, mobile-friendly interface

## 📁 Project Structure

```
mock/
├── index.html                 # Main application entry point
├── style.css                  # Application styles and themes
├── app.js                     # Main application logic
├── js/                        # JavaScript modules
│   └── config/                # Configuration modules
│       ├── constants.js       # App constants and configuration
│       ├── syllabusMapping.js # RRB syllabus mapping and keywords
│       └── examPatterns.js    # CBT exam patterns and test generation
└── README.md                  # Project documentation
```

### Configuration Modules

- **`constants.js`**: Application-wide constants, scoring configuration, UI settings, and error messages
- **`syllabusMapping.js`**: Comprehensive RRB Technician Grade-3 Signal syllabus mapping with chapter keywords for intelligent question categorization
- **`examPatterns.js`**: CBT exam patterns, test generation config, and pattern utilities for full mock test support

## 📦 Installation

### Option 1: Direct Download
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start using the app immediately!

🎯 Quick Start Guide
1. First Time Setup
Open the app in your browser
Create a user profile with your name
You'll see the dashboard with sample questions loaded
2. Adding Questions
Manual Entry:

Go to "Question Bank" section
Click "Add Question"
Fill in question details and save
PDF Upload:

Click "Upload PDF Questions"
Select your PDF file with questions
Set subject and chapter information
Review and confirm extracted questions
3. Taking Tests
Navigate to "Take Tests" section

Choose your test type:

Full Mock Test: Complete exam simulation
Subject-wise Test: Focus on specific subjects
Custom Test: Configure your own test parameters
PYQ Test: Previous year questions only
Complete the test and review your performance

4. Viewing Analytics
Check "Analytics" section for detailed performance insights
View charts for subject-wise performance, progress tracking, and time analysis
📚 Supported Question Formats
The PDF extraction system supports multiple question formats:

Code
Format 1: Q1. Question text? A) option B) option C) option D) option
Format 2: Question 1: Question text? A) option B) option C) option D) option  
Format 3: 1. Question text? (a) option (b) option (c) option (d) option
🎨 Subjects Covered
Mathematics (Algebra, Geometry, Arithmetic)
General Intelligence & Reasoning (Coding, Series, Logic)
Basic Science & Engineering (Physics, Electronics, Electrical)
General Awareness (Current Affairs, History, Geography)
Computer Applications (MS Office, Basic Programming)
🔧 Configuration
Test Settings
Question Count: 10-100 questions
Time Duration: 10-90 minutes
Subject Distribution: Customizable per subject
Difficulty Levels: Easy, Medium, Hard
PDF Upload Settings
File Size Limit: 50MB
Supported Format: PDF only
Extraction Methods: Multiple parsing strategies
Validation: Automatic quality checks
📱 Browser Compatibility
Browser	Version	Status
Chrome	80+	✅ Full Support
Firefox	75+	✅ Full Support
Safari	13+	✅ Full Support
Edge	80+	✅ Full Support
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🐛 Known Issues & Limitations
PDF extraction works best with well-formatted documents
Data is stored locally in browser (consider regular backups)
No server-side functionality (purely client-side)
🔮 Roadmap
 Question import/export functionality
 Better PDF format support
 Offline capability with service workers
 Advanced question categorization
 Performance comparison features
 Mobile app version
📞 Support
If you encounter any issues or have questions:

Check the Issues page
Create a new issue with detailed description
Include browser information and steps to reproduce
🙏 Acknowledgments
PDF.js team for excellent PDF processing library
Chart.js team for beautiful chart components
RRB exam preparation community for feedback and testing
Happy Learning! 🎓

Made with ❤️ for RRB Technician Grade-3 Signal aspirants

Code

### 2. .gitignore

```gitignore name=.gitignore
# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Build outputs
dist/
build/

# Backup files
*.bak
*.backup

### Option 2: Live Server (Recommended for development)
```bash
# Clone the repository
git clone https://github.com/Ravi-katta-dev/mock-test-app.git
cd mock-test-app

# If using VS Code with Live Server extension
# Right-click index.html → "Open with Live Server"


