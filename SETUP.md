# Rizz Events - Setup & Deployment Guide

## Overview

Rizz Events is a white-label corporate event hosting and ticketing platform built with Next.js 14, featuring a public-facing event website with dynamic content and a JWT-authenticated admin dashboard.

## Features

### Public Website
- **Hero Section**: Event name, date, venue with live countdown timer
- **Ticket Packages**: Display different ticket tiers with pricing and benefits
- **Sponsors/Partners**: Showcase sponsor logos and information
- **Gallery**: Event image gallery
- **Contact Section**: Event contact information
- **Booking Lookup**: Users can check booking status and download tickets

### Admin Dashboard
- **Event Management**: Configure event details, dates, venues, and descriptions
- **Branding Control**: Set brand colors and manage client logos
- **Ticket Packages**: Full CRUD for ticket tiers with installment options
- **Sponsors Management**: Add and manage event sponsors
- **Gallery Management**: Upload and manage event images
- **Contact Information**: Manage event contact details

### Technical Features
- **JWT Authentication**: Secure admin login with username/password
- **Unique Booking Codes**: Auto-generated codes for each booking
- **Installment Support**: Configure payment plans per ticket package
- **Art Deco Design**: Cinematic luxury aesthetic with gold accents
- **Database-Driven**: All content stored in MySQL database
- **Vercel Ready**: Optimized for zero-configuration Vercel deployment

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Deployment**: Vercel

## Local Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- MySQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rizz-events-nextjs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/rizz_events
   JWT_SECRET=your-secret-key-here
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   OWNER_OPEN_ID=your-owner-id
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   BUILT_IN_FORGE_API_KEY=your-api-key
   ```

4. **Set up the database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Create admin credentials**
   Insert an admin user into the database:
   ```sql
   INSERT INTO admin_credentials (username, passwordHash, email)
   VALUES ('admin', '<hashed-password>', 'admin@example.com');
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Admin Access

### First Time Setup

1. Navigate to `/admin/login`
2. Enter your admin credentials (username/password)
3. Upon successful login, you'll be redirected to the admin dashboard

### Admin Dashboard Routes

- `/admin` - Main dashboard (redirects to event management)
- `/admin/login` - Admin login page
- Event Management - Configure event details and branding
- Ticket Packages - Manage ticket tiers
- Sponsors - Add and manage sponsors
- Gallery - Upload and manage images

## Public Website Routes

- `/` - Main event page with all details
- `/booking-lookup` - Booking code lookup for ticket status

## Database Schema

### Core Tables

**events** - Event configuration and branding
- Event name, date, venue
- Brand colors and logo
- Contact information

**ticket_packages** - Ticket tiers
- Name, price, capacity
- Benefits list
- Installment options

**sponsors** - Event sponsors
- Name, logo, website
- Display order

**gallery_images** - Event photos
- Image URL and key
- Caption and display order

**bookings** - Customer bookings
- Unique booking code
- Attendee information
- Payment status
- Ticket download URL

**payments** - Payment records
- Amount and status
- Payment method
- Transaction ID

**admin_credentials** - Admin users
- Username and password hash
- Email

## API Endpoints

### Public Procedures

**event.get** - Fetch event details
```typescript
trpc.event.get.useQuery(eventId)
```

**packages.list** - List ticket packages
```typescript
trpc.packages.list.useQuery(eventId)
```

**sponsors.list** - List sponsors
```typescript
trpc.sponsors.list.useQuery(eventId)
```

**gallery.list** - List gallery images
```typescript
trpc.gallery.list.useQuery(eventId)
```

**bookings.create** - Create a new booking
```typescript
trpc.bookings.create.useMutation()
```

**bookings.getByCode** - Lookup booking by code
```typescript
trpc.bookings.getByCode.useQuery(bookingCode)
```

### Admin Procedures (Protected)

**admin.login** - Admin login
```typescript
trpc.admin.login.useMutation()
```

**admin.logout** - Admin logout
```typescript
trpc.admin.logout.useMutation()
```

**event.update** - Update event details
```typescript
trpc.event.update.useMutation()
```

**packages.create/update/delete** - Manage ticket packages
```typescript
trpc.packages.create.useMutation()
trpc.packages.update.useMutation()
trpc.packages.delete.useMutation()
```

**sponsors.create/update/delete** - Manage sponsors
```typescript
trpc.sponsors.create.useMutation()
trpc.sponsors.update.useMutation()
trpc.sponsors.delete.useMutation()
```

**gallery.create/delete** - Manage gallery
```typescript
trpc.gallery.create.useMutation()
trpc.gallery.delete.useMutation()
```

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository with the code
- MySQL database (can use Vercel's database service or external provider)

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "Other" as the framework

3. **Configure Environment Variables**
   In Vercel project settings, add:
   - `DATABASE_URL` - Your MySQL connection string
   - `JWT_SECRET` - Secure random string
   - `VITE_APP_ID` - Your app ID
   - `OAUTH_SERVER_URL` - OAuth server URL
   - `OWNER_OPEN_ID` - Owner ID
   - `BUILT_IN_FORGE_API_URL` - API URL
   - `BUILT_IN_FORGE_API_KEY` - API key
   - `NODE_ENV` - Set to `production`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

5. **Post-Deployment**
   - Verify the deployment at your Vercel URL
   - Test admin login at `/admin/login`
   - Create test event data through the admin dashboard

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

## Design System

The application uses an **Art Deco** aesthetic with:
- **Colors**: Deep black (#000000) with metallic gold (#D4AF37)
- **Typography**: Playfair Display for headlines, Montserrat for body
- **Layout**: Symmetrical, structured with geometric ornamentation
- **Feel**: Cinematic grandeur and timeless luxury

## File Structure

```
rizz-events-nextjs/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx (public event page)
│   │   │   ├── BookingLookup.tsx (booking status page)
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── EventManagement.tsx
│   │   │       ├── TicketPackagesManagement.tsx
│   │   │       ├── SponsorsManagement.tsx
│   │   │       └── GalleryManagement.tsx
│   │   ├── App.tsx (routing)
│   │   └── index.css (Art Deco design system)
├── server/
│   ├── auth.ts (JWT and password utilities)
│   ├── db.ts (database query helpers)
│   ├── routers.ts (tRPC procedures)
│   └── _core/ (framework internals)
├── drizzle/
│   ├── schema.ts (database schema)
│   └── migrations/ (SQL migrations)
└── package.json
```

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
- Check build logs for specific errors

## Support & Documentation

For more information, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is proprietary and confidential.
