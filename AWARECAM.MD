# AwareCam - Video Intelligence Platform

## Overview

AwareCam is a comprehensive video intelligence platform that provides real-time camera monitoring, AI-powered event detection, workflow management, and organizational oversight capabilities. The platform combines modern web technologies with advanced streaming infrastructure to deliver a complete video surveillance and management solution.

## Latest updates (local dev)

- Frontend: Vite dev server running on http://localhost:5175 (auto-fallback if 5173/5174 are in use)
- Backend: Flask configured to run on http://localhost:3000 (see `api/app.py`)
- Frontend API base URL: `.env` contains `VITE_API_URL=http://localhost:3000`
- User entity: Added missing `me()`, `login()`, `logout()`, `getCurrentUser()` in `src/api/entities.js`
- Backend requirements installed in a Python 3.11 virtualenv under `api/.venv`
- Pending: Valid `SUPABASE_URL` and `SUPABASE_KEY` required for backend to fully start

Quick restart commands
- Kill dev servers (PowerShell): `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`
- Start frontend (project root): `npm run dev`
- Start backend (from `api/`): `./.venv/Scripts/Activate.ps1; python app.py`

## Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite build system
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: Zustand for global state, React Context for user management
- **Routing**: React Router DOM v7
- **Animation**: Framer Motion for smooth transitions
- **Charts**: Recharts for analytics visualization
- **Forms**: React Hook Form with Zod validation

### Backend (Flask + Python)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: Supabase Auth integration
- **Streaming**: MediaMTX for RTSP to HLS conversion
- **Caching**: Redis for session and data caching
- **API**: RESTful API with comprehensive error handling

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Streaming Server**: MediaMTX for video processing
- **Database**: PostgreSQL for persistent data storage
- **Cache**: Redis for performance optimization

## Core Features

### 1. Camera Management
- **Multi-camera Support**: Manage unlimited IP cameras with RTSP streams
- **Real-time Streaming**: Live video feeds with HLS streaming
- **Camera Health Monitoring**: Automated status checking and alerting
- **Location-based Organization**: Group cameras by physical locations
- **Demo Data Integration**: Built-in demo cameras for testing and onboarding

### 2. Live Monitoring
- **Grid Layouts**: Flexible 1x1 to 4x4 camera grid layouts
- **Custom Layouts**: Save and manage custom camera arrangements
- **Fullscreen Viewing**: Individual camera fullscreen mode
- **Location Filtering**: Filter cameras by physical locations
- **Real-time Updates**: Live status updates and health monitoring

### 3. Event Detection & Analytics
- **AI-Powered Detection**: Automated event detection using computer vision
- **Event Classification**: Categorize events by type (person, vehicle, safety violations)
- **Severity Levels**: Critical, high, medium, and low priority events
- **Confidence Scoring**: AI confidence levels for detected events
- **Event Timeline**: Historical event tracking and analysis

### 4. Workflow Management (Add-on Feature)
- **Employee Management**: Comprehensive employee database and role management
- **Task Assignment**: Create and assign tasks to employees
- **Workflow Templates**: Pre-built workflow templates for common scenarios
- **AI Task Monitoring**: Automated task validation and monitoring
- **Approval Workflows**: Multi-level approval processes

### 5. Alert System
- **Real-time Notifications**: Instant alerts for critical events
- **Multi-channel Delivery**: Email, SMS, and in-app notifications
- **Customizable Rules**: Configurable alert rules and thresholds
- **Escalation Policies**: Automatic escalation for unacknowledged alerts
- **Notification History**: Complete audit trail of all notifications

### 6. Analytics Dashboard
- **Performance Metrics**: Camera uptime, event counts, and system health
- **Compliance Tracking**: Monitor adherence to safety protocols
- **Trend Analysis**: Historical data visualization and reporting
- **Custom Reports**: Generate detailed reports for management
- **Export Capabilities**: Data export in multiple formats

### 7. User Management & Security
- **Role-based Access Control**: Granular permissions system
- **Multi-tenant Architecture**: Organization-based data isolation
- **Platform Administration**: Super admin capabilities for platform management
- **User Onboarding**: Guided setup process for new users
- **Session Management**: Secure authentication and session handling

### 8. Media Library
- **Event Recording**: Automatic recording of detected events
- **Media Storage**: Centralized storage for all video content
- **Search & Filter**: Advanced search capabilities for media files
- **Export Options**: Download and share media content
- **Retention Policies**: Automated cleanup of old media files

## Technical Implementation

### Streaming Architecture
```
RTSP Camera → MediaMTX → HLS Stream → React Player
     ↓
PostgreSQL Database ← Flask API ← React Frontend
     ↓
Redis Cache ← Background Services
```

### Database Schema
- **Users**: User accounts and authentication data
- **Organizations**: Multi-tenant organization structure
- **Cameras**: Camera configurations and status
- **Streams**: Active streaming sessions and metadata
- **Events**: Detected events and analytics data
- **Tasks**: Workflow tasks and assignments
- **Notifications**: Alert and notification history

### API Endpoints
- **Authentication**: `/auth/*` - User login, registration, token management
- **Cameras**: `/cameras/*` - Camera CRUD operations and status
- **Streams**: `/streams/*` - Stream management and control
- **Events**: `/events/*` - Event data and analytics
- **Users**: `/users/*` - User management and profiles
- **Organizations**: `/organizations/*` - Organization management

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS Enforcement**: SSL/TLS encryption for all communications

## Deployment

### Development Setup
```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r requirements.txt
python app.py

# Docker
docker-compose up -d
```

### Production Deployment
- **Environment Variables**: Configure database, Redis, and Supabase credentials
- **SSL Certificates**: Set up HTTPS with proper certificates
- **Database Migrations**: Run Alembic migrations for schema updates
- **Media Storage**: Configure persistent storage for video files
- **Monitoring**: Set up logging and monitoring for production

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances behind load balancer
- **Database Optimization**: Connection pooling and query optimization
- **CDN Integration**: Content delivery network for video streaming
- **Caching Strategy**: Redis clustering for high availability
- **Media Processing**: Dedicated servers for video processing

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/awarecam

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# MediaMTX
MEDIAMTX_API_URL=http://localhost:9997
MEDIAMTX_DOMAIN=api.awarecam.com

# Redis
REDIS_URL=redis://localhost:6379

# Flask
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

### MediaMTX Configuration
- **RTSP Support**: Automatic RTSP stream detection and conversion
- **HLS Streaming**: HTTP Live Streaming for web compatibility
- **WebRTC Support**: Real-time communication for low-latency viewing
- **Authentication**: Basic auth for stream access control
- **CORS**: Cross-origin resource sharing configuration

## Integration Capabilities

### External APIs
- **Supabase**: Authentication and real-time database
- **Payment Processing**: Stripe integration for billing
- **Notification Services**: Email and SMS providers
- **Cloud Storage**: AWS S3 or similar for media storage
- **Analytics**: Google Analytics or custom analytics

### Webhook Support
- **Event Notifications**: Real-time webhook delivery for events
- **Status Updates**: Camera and system status webhooks
- **Custom Integrations**: Flexible webhook system for third-party tools

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components and routes
- **Image Optimization**: Compressed and responsive images
- **Caching**: Browser caching for static assets
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis caching for frequently accessed data
- **Async Processing**: Background tasks for heavy operations

### Streaming Optimizations
- **Adaptive Bitrate**: Quality adjustment based on network conditions
- **CDN Integration**: Global content delivery for video streams
- **Compression**: Video compression for bandwidth optimization
- **Buffering**: Intelligent buffering for smooth playback

## Monitoring & Maintenance

### Health Checks
- **API Health**: Regular endpoint health monitoring
- **Database Health**: Connection and query performance monitoring
- **Stream Health**: Camera and streaming service monitoring
- **System Resources**: CPU, memory, and disk usage tracking

### Logging
- **Application Logs**: Comprehensive application logging
- **Error Tracking**: Detailed error logging and tracking
- **Audit Logs**: User action and system change logging
- **Performance Logs**: Response time and throughput monitoring

### Backup & Recovery
- **Database Backups**: Automated database backup scheduling
- **Media Backups**: Video content backup and archival
- **Configuration Backups**: System configuration backup
- **Disaster Recovery**: Complete system recovery procedures

## Future Roadmap

### Planned Features
- **Mobile Applications**: Native iOS and Android apps
- **Advanced AI**: Enhanced computer vision and machine learning
- **IoT Integration**: Sensor and device integration
- **Advanced Analytics**: Predictive analytics and insights
- **Multi-language Support**: Internationalization capabilities

### Technical Improvements
- **Microservices Architecture**: Service-oriented architecture migration
- **Kubernetes Deployment**: Container orchestration for scalability
- **GraphQL API**: Modern API architecture with GraphQL
- **Real-time Collaboration**: Multi-user real-time features
- **Edge Computing**: Edge processing for reduced latency

## Support & Documentation

### Documentation
- **API Documentation**: Comprehensive API reference
- **User Guides**: Step-by-step user documentation
- **Developer Guides**: Technical implementation guides
- **Troubleshooting**: Common issues and solutions

### Support Channels
- **Technical Support**: Email and ticket-based support
- **Community Forum**: User community and knowledge sharing
- **Video Tutorials**: Comprehensive video documentation
- **Live Chat**: Real-time support during business hours

---

**AwareCam** - Empowering organizations with intelligent video surveillance and workflow management through cutting-edge technology and user-centric design.
