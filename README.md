# Rizz Events - White-Label Event Ticketing Platform

A full-stack event management and ticketing platform built with Next.js 14, featuring a public-facing event website with dynamic content and a JWT-authenticated admin dashboard. Designed for corporate event hosting with zero-configuration Vercel deployment.

## Overview

Rizz Events is a white-label platform that enables event organizers to host beautiful, branded event websites with integrated ticketing and booking management. The platform features:

- **Public Event Website**: Dynamic, Art Deco-designed event pages with countdown timers, ticket packages, sponsor showcases, and galleries
- **Admin Dashboard**: Complete control over event details, branding, ticket packages, sponsors, and gallery images
- **Booking System**: Unique booking codes, installment payment options, and booking status tracking
- **Notifications**: Automated notifications for bookings and payments sent to both attendees and administrators
- **File Storage**: Integrated storage for logos, sponsor images, and event galleries

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MySQL database
- Environment variables configured

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd rizz-events-nextjs
   pnpm install
   ```

2. **Configure environment**
   Create `.env.local`:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/rizz_events
   JWT_SECRET=your-secret-key-here
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   OWNER_OPEN_ID=your-owner-id
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   BUILT_IN_FORGE_API_KEY=your-api-key
   ```

3. **Set up database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

Access the app at `http://localhost:3000`

## Features

### Public Website
- **Hero Section**: Event name, date, venue with live countdown timer
- **Ticket Packages**: Multiple pricing tiers with benefits and capacity management
- **Sponsors/Partners**: Showcase sponsor logos and information
- **Gallery**: Event photo gallery with captions
- **Contact Section**: Email, phone, and address information
- **Booking Lookup**: Users can check booking status and download tickets using booking codes

### Admin Dashboard (`/admin`)
- **Event Management**: Configure event details, dates, venues, and descriptions
- **Branding Control**: Set brand colors, upload client logos, customize themes
- **Ticket Packages**: Full CRUD for ticket tiers with installment options
- **Sponsors Management**: Add and manage event sponsors with logos
- **Gallery Management**: Upload and organize event images
- **Contact Information**: Manage event contact details

### Booking & Payments
- **Unique Booking Codes**: Auto-generated codes for each booking
- **Installment Support**: Configure payment plans per ticket package
- **Payment Status Tracking**: Real-time booking and payment status
- **Notifications**: Automated emails to buyers and admins on booking and payment events

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS 4 |
| **Backend** | Express 4 + tRPC 11 |
| **Database** | MySQL with Drizzle ORM |
| **Authentication** | JWT (jsonwebtoken) |
| **File Storage** | S3-compatible storage |
| **Deployment** | Vercel |

## Project Structure

```
rizz-events-nextjs/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx                    # Public event page
│   │   │   ├── BookingLookup.tsx           # Booking status page
│   │   │   ├── BookingForm.tsx             # Booking form component
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx          # Admin login
│   │   │       ├── AdminDashboard.tsx      # Admin main dashboard
│   │   │       ├── EventManagement.tsx     # Event details management
│   │   │       ├── TicketPackagesManagement.tsx
│   │   │       ├── SponsorsManagement.tsx
│   │   │       └── GalleryManagement.tsx
│   │   ├── App.tsx                         # Routing and layout
│   │   └── index.css                       # Art Deco design system
├── server/
│   ├── auth.ts                             # JWT and password utilities
│   ├── db.ts                               # Database query helpers
│   ├── routers.ts                          # tRPC procedures
│   ├── notifications.ts                    # Booking/payment notifications
│   ├── fileUpload.ts                       # File upload handlers
│   └── _core/                              # Framework internals
├── drizzle/
│   ├── schema.ts                           # Database schema
│   └── migrations/                         # SQL migrations
└── package.json
```

## Database Schema

### Core Tables

**events** - Event configuration and branding
- Event name, date, venue, description
- Brand colors, logo, theme
- Contact information

**ticket_packages** - Ticket tiers
- Name, price, capacity, benefits
- Installment options

**sponsors** - Event sponsors
- Name, logo URL, website, display order

**gallery_images** - Event photos
- Image URL, key, caption, display order

**bookings** - Customer bookings
- Unique booking code, attendee info
- Payment status, ticket download URL

**payments** - Payment records
- Amount, status, payment method, transaction ID

**admin_credentials** - Admin users
- Username, password hash, email

## Admin Workflow

### First-Time Setup

1. Navigate to `/admin/login`
2. Enter admin credentials (username/password)
3. Configure event details on the dashboard
4. Upload event logo and set brand colors
5. Create ticket packages with pricing and benefits
6. Add sponsors and their logos
7. Upload gallery images
8. Set contact information

### Managing Events

- **Event Details**: Update name, date, venue, and description
- **Branding**: Change logo, colors, and theme
- **Tickets**: Add/edit/delete ticket packages with installment options
- **Sponsors**: Manage sponsor information and logos
- **Gallery**: Upload and organize event photos
- **Bookings**: View all bookings and update payment status

## API Endpoints

### Public Procedures

| Endpoint | Method | Description |
|----------|--------|-------------|
| `event.get` | Query | Fetch event details |
| `packages.list` | Query | List ticket packages |
| `sponsors.list` | Query | List sponsors |
| `gallery.list` | Query | List gallery images |
| `bookings.create` | Mutation | Create a new booking |
| `bookings.getByCode` | Query | Lookup booking by code |

### Admin Procedures (Protected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `admin.login` | Mutation | Admin login |
| `admin.logout` | Mutation | Admin logout |
| `admin.me` | Query | Get current admin info |
| `event.update` | Mutation | Update event details |
| `event.create` | Mutation | Create new event |
| `packages.create/update/delete` | Mutation | Manage ticket packages |
| `sponsors.create/update/delete` | Mutation | Manage sponsors |
| `gallery.create/delete` | Mutation | Manage gallery images |

## Design System

The platform uses an **Art Deco** aesthetic with:

- **Color Palette**: Deep black (#000000) with metallic gold (#D4AF37)
- **Typography**: Playfair Display for headlines, Montserrat for body text
- **Layout**: Symmetrical, structured with geometric ornamentation
- **Feel**: Cinematic grandeur and timeless luxury

## Testing

Run the test suite:
```bash
pnpm test
```

Tests include:
- Password hashing and verification
- JWT token generation and validation
- Booking code generation
- Admin authentication
- Protected procedure access control

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository with code
- MySQL database (Vercel Postgres or external)

### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "Other" as framework

3. **Configure Environment Variables**
   In Vercel project settings, add:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Secure random string
   - `VITE_APP_ID` - Your app ID
   - `OAUTH_SERVER_URL` - OAuth server URL
   - `OWNER_OPEN_ID` - Owner ID
   - `BUILT_IN_FORGE_API_URL` - API URL
   - `BUILT_IN_FORGE_API_KEY` - API key
   - `NODE_ENV` - Set to `production`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

5. **Post-Deployment**
   - Test admin login at `/admin/login`
   - Create test event data through dashboard
   - Verify public website displays correctly

## File Upload

The platform supports file uploads for:
- **Event Logos**: Client branding
- **Sponsor Logos**: Partner branding
- **Gallery Images**: Event photos

Files are validated for:
- File type (JPEG, PNG, GIF, WebP)
- File size (max 5MB)
- Magic bytes verification

## Notifications

### Booking Notifications
- Sent to buyer and admin when booking is created
- Includes booking code, package details, and total price

### Payment Notifications
- Sent to buyer and admin on payment events
- Includes payment amount and status

Currently uses console logging for development. For production, integrate with an email service like SendGrid or AWS SES.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure MySQL server is running
- Check network connectivity

### Admin Login Not Working
- Verify admin credentials exist in database
- Check `JWT_SECRET` is set correctly
- Clear browser cookies and try again

### Build Errors on Vercel
- Check all environment variables are set
- Verify Node.js version compatibility
- Review build logs for specific errors

## Development Guidelines

### Adding Features

1. **Update Schema**: Modify `drizzle/schema.ts`
2. **Generate Migration**: Run `pnpm drizzle-kit generate`
3. **Apply Migration**: Use `webdev_execute_sql` with generated SQL
4. **Add Query Helpers**: Update `server/db.ts`
5. **Create Procedures**: Add to `server/routers.ts`
6. **Build UI**: Create components in `client/src/pages/`
7. **Write Tests**: Add tests to `server/*.test.ts`
8. **Run Tests**: Execute `pnpm test`

### Code Style

- Use TypeScript throughout
- Follow existing patterns for tRPC procedures
- Use Tailwind CSS for styling
- Add tests for new features
- Run `pnpm format` before committing

## Performance Considerations

- Database queries are optimized with proper indexing
- File uploads are validated before storage
- Booking codes are generated with cryptographic randomness
- JWT tokens have configurable expiration
- API responses use tRPC's type-safe caching

## Security

- **Authentication**: JWT-based admin authentication
- **Password Security**: bcrypt hashing with salt
- **Token Validation**: Signature verification on every request
- **File Validation**: Magic bytes verification for uploaded files
- **CORS**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in `.env.local`

## Support & Documentation

For more information, refer to:
- [SETUP.md](./SETUP.md) - Detailed setup and deployment guide
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is proprietary and confidential.

---

**Built with ❤️ for event organizers who demand excellence.**
