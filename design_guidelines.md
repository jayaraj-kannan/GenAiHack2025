# Trip Planner App Design Guidelines

## Design Approach
**Selected Approach**: Hybrid approach combining Airbnb's travel-focused visual design with Material Design's structured UI components for the planning interface.

**Justification**: This travel app requires both emotional engagement (destination discovery) and functional efficiency (itinerary planning), necessitating a balance between visual appeal and utility.

## Core Design Elements

### Color Palette
**Primary Colors (Dark/Light Mode)**:
- Primary Brand: 220 85% 45% / 220 85% 65% (Deep travel blue)
- Secondary: 200 70% 35% / 200 70% 55% (Ocean teal)
- Background: 220 15% 8% / 0 0% 98% (Dark slate / Light gray)
- Surface: 220 10% 12% / 0 0% 100% (Card backgrounds)

**Accent Colors**:
- Success: 140 65% 45% (Booking confirmations)
- Warning: 35 85% 55% (Weather alerts)
- Accent: 280 60% 60% (AI suggestions, sparingly used)

**Gradients**: Subtle blue-to-teal gradients for hero sections and AI-powered features. Deep blue to ocean teal for destination cards and call-to-action backgrounds.

### Typography
- **Primary**: Inter (Google Fonts) - Clean, readable for UI text
- **Headings**: Poppins (Google Fonts) - Friendly, approachable for destination names
- **Sizes**: Text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

### Layout System
**Spacing Primitives**: Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Section spacing: p-8, m-8 (32px)
- Large spacing: p-12, m-12 (48px)

### Component Library

**Navigation**: 
- Top navigation with destination search bar as primary element
- Sticky secondary navigation for itinerary sections during planning

**Core Components**:
- Destination cards with gradient overlays and mood badges
- AI suggestion panels with subtle accent color borders
- Interactive timeline for itinerary display
- Weather forecast cards with icon integration
- Budget breakdown components with progress indicators

**Forms**:
- Floating label inputs for trip preferences
- Multi-select mood chips for AI planning
- Date range pickers with calendar visualization
- Group member invitation interface

**Data Display**:
- Interactive maps integration for route visualization
- Cost breakdown tables with category icons
- Activity timeline with time-distance optimization display
- Weather forecast widgets with 3-day preview

**Overlays**:
- Booking confirmation modals with payment integration
- AI suggestion popover with Plan B alternatives
- Collaborative voting interface for group decisions
- Offline download progress indicators

### Images
**Hero Section**: Large destination imagery (1200x600px) with gradient overlay and search interface positioned over blurred background buttons for booking CTAs.

**Destination Cards**: Medium-sized images (400x250px) with mood-based color overlays indicating trip type (adventure, culture, relaxation).

**Activity Thumbnails**: Small square images (120x120px) for itinerary items with time and cost overlays.

### Visual Hierarchy
- Large hero search as primary focal point
- AI-powered suggestions highlighted with accent color borders
- Itinerary timeline as central planning interface
- Cost information prominently displayed but not overwhelming
- Weather integration seamlessly embedded in planning flow

### Interactive Elements
- Smooth transitions between planning steps
- Hover states for destination exploration
- Real-time updates for collaborative planning
- Responsive feedback for AI processing states
- One-click booking with clear visual confirmation flow