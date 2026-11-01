# 🔒 CyberScan-Pro - Advanced Web Vulnerability Scanner

A comprehensive web security scanning platform with advanced penetration testing capabilities. Built with React frontend and Flask backend, featuring real-time vulnerability detection, detailed reporting, and persistent data storage.

## 🌟 Features

### 🛡️ Advanced Security Scanning
- **XSS Detection**: Cross-site scripting vulnerability testing with multiple payload types
- **SQL Injection**: Advanced SQL injection detection with comprehensive payload testing
- **CORS & Clickjacking**: Security header analysis and iframe protection testing
- **SSRF & Command Injection**: Server-side request forgery and command execution detection
- **Authentication Bypass**: Admin panel access and default credential testing
- **Dependency Analysis**: JavaScript library vulnerability scanning

### 🎯 Basic Security Scanning
- Security headers analysis
- SSL/TLS configuration checks
- Server fingerprinting
- JavaScript library vulnerability detection
- Basic HTML analysis

### 💾 Data Persistence
- Supabase integration for scan history
- User-specific data storage
- Dashboard with trend analysis
- Cross-session data retention

### 📊 Comprehensive Reporting
- PDF report generation
- Detailed vulnerability breakdown
- Risk scoring system
- Severity classification (Critical, High, Medium, Low)
- Remediation recommendations

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Real-time scan progress tracking
- Interactive vulnerability details
- Professional dashboard interface
- shadcn/ui components

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
FrontendProject/CyberScan-Pro/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/             # Page components
│   ├── integrations/       # Supabase integration
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── package.json           # Dependencies
```

### Backend (Flask + Python)
```
web-vulnerability/
├── app.py                # Main Flask application
├── requirements.txt        # Python dependencies
└── security_modules/      # Advanced scanning modules
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Supabase account (for data persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rathodsudhakar/cyberscan-pro.git
   cd cyberscan-pro
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd FrontendProject/cyberScan-pro
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../../web-vulnerability
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   - Create `.env` file in `FrontendProject/  CyberScan-Pro/`
   - Add Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd web-vulnerability
   python app.py
   ```
   Backend runs on: `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd ../FrontendProject/CyberScan-Pro
   npm run dev
   ```
   Frontend runs on: `http://localhost:8080`

3. **Access the Application**
   Open your browser and navigate to `http://localhost:8080`

## 🔧 Configuration

### Backend Configuration
- Flask app runs on port 5000 by default
- CORS enabled for frontend-backend communication
- SSL verification disabled for testing (enable in production)

### Frontend Configuration
- React development server on port 8080
- Vite build system
- Tailwind CSS for styling
- React Router for navigation

### Database Configuration
- Supabase for production data persistence
- User authentication and scan history storage
- Real-time data synchronization

## 📡 API Endpoints

### Scanning APIs
- `POST /api/scan` - Basic security scan
- `POST /api/advanced-scan` - Comprehensive security scan
- `POST /api/download-report` - PDF report generation

### Advanced Scan Features
- **XSS Testing**: 8+ payload variations
- **SQL Injection**: 10+ injection techniques
- **Security Headers**: CORS, CSP, X-Frame-Options analysis
- **SSRF Testing**: Internal resource access attempts
- **Command Injection**: Shell command execution detection
- **Auth Bypass**: Default credential and admin panel testing

## 🔍 Vulnerability Detection

### Severity Levels
- **🔴 Critical**: Immediate security risk (SQL Injection, Command Injection)
- **🟠 High**: Significant security issue (XSS, SSRF, Auth Bypass)
- **🟡 Medium**: Moderate security concern (Missing Headers, Vulnerable Dependencies)
- **🟢 Low**: Minor security issue (Outdated Libraries)

### Risk Scoring
- Critical: 25 points each
- High: 15 points each
- Medium: 8 points each
- Low: 3 points each
- Maximum risk score: 100

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Supabase** - Database & Auth

### Backend
- **Flask** - Web framework
- **Python 3.8+** - Backend language
- **Requests** - HTTP client
- **BeautifulSoup4** - HTML parsing
- **ReportLab** - PDF generation
- **Flask-CORS** - Cross-origin support

## 📈 Performance

### Scan Optimization
- **Basic Scan**: ~30-45 seconds
- **Advanced Scan**: ~45-75 seconds (optimized)
- **Concurrent Testing**: Multiple vulnerability categories
- **Smart Timeouts**: 3-second request limits
- **Payload Optimization**: Reduced test sets for speed

### Scalability
- Redis caching (planned)
- Background job processing
- API rate limiting
- Database connection pooling

## 🔒 Security Features

### Data Protection
- User authentication with Supabase Auth
- Encrypted data transmission
- Secure API endpoints
- Input validation and sanitization

### Scan Safety
- Non-destructive testing
- Read-only vulnerability detection
- Safe payload injection
- Network timeout protection

## 🐛 Development

### Code Quality
- TypeScript for type safety
- ESLint for code standards
- Prettier for code formatting
- Git hooks for pre-commit checks

### Testing
- Unit tests (planned)
- Integration tests (planned)
- E2E testing with Cypress (planned)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: rathodsudhakar7821@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/rathodsudhakar/cyberscan-pro/issues)
- 📖 Documentation: [Wiki](https://github.com/rathodsudhakar/cyberscan-pro/wiki)

## 🙏 Acknowledgments

- [OWASP](https://owasp.org/) - Security testing guidelines
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**⚡ Built with passion for web security!**
