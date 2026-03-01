# Feature Specification: Irha Beauty — Frontend Storefront

**Feature Branch**: `004-nextjs-storefront`
**Created**: 2026-02-28
**Status**: Draft
**Constitution**: v4.0.0

---

## Overview

Build the complete customer-facing online store for Irha Beauty — a luxury Pakistani beauty brand specialising in hair care products. The storefront must deliver a high-end, animated shopping experience inspired by premium global beauty brands (reference: premiumwallartstudio.com). Customers can discover products, add to cart, and place Cash on Delivery orders — with or without an account.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse & Discover Products (Priority: P1)

A first-time visitor lands on the homepage and is immediately drawn in by a full-screen animated banner showcase. They browse the three product categories — Oils, Fragrance, and Shampoo — and navigate to a product detail page to learn more before deciding to buy.

**Why this priority**: This is the entry point for every customer. If browsing is not beautiful and intuitive, no purchase ever happens. All other stories depend on this one working first.

**Independent Test**: Visit the homepage → see the animated hero carousel cycling through Oils, Fragrance, and Shampoo banners → click "Discover Now" on the Shampoo banner → land on the Shampoo category page → click the Shampoo product → view full product detail with images, price, and description.

**Acceptance Scenarios**:

1. **Given** a visitor opens the homepage, **When** the page loads, **Then** a full-screen hero carousel is visible showing the first banner with an animated "Discover Now" button, and the carousel automatically advances every 4 seconds.
2. **Given** the hero carousel is running, **When** the visitor watches without interaction, **Then** the carousel cycles through all three banners (Oils → Shampoo → Fragrance) with smooth animated transitions and each banner displays its own "Discover Now" button.
3. **Given** a visitor clicks "Discover Now" on the Shampoo banner, **When** the click is registered, **Then** the visitor is taken to the Shampoo category page showing the available product.
4. **Given** a visitor clicks "Discover Now" on the Oils or Fragrance banner, **When** the click is registered, **Then** the visitor is taken to that category's page which displays a beautiful "Coming Soon" message.
5. **Given** a visitor is on the homepage, **When** they scroll down, **Then** each section (categories grid, featured product, testimonials area) animates into view one by one as the visitor reaches it.
6. **Given** a visitor is on the product detail page, **When** they hover over the product image, **Then** a second product image smoothly appears in place of the first.
7. **Given** a visitor opens any page on a mobile phone, **When** the page loads, **Then** the layout adapts correctly and all animations still play.

---

### User Story 2 — Add to Cart & Place an Order (Priority: P1)

A customer who has found the shampoo product adds it to their cart, reviews the cart, proceeds to checkout, fills in their delivery details, and places a Cash on Delivery order.

**Why this priority**: This is the core revenue-generating flow. The entire store exists to complete this journey.

**Independent Test**: Open product detail page → click "Add to Cart" → open cart → proceed to checkout → fill in name, address, phone → place COD order → see confirmation.

**Acceptance Scenarios**:

1. **Given** a visitor is on the product detail page, **When** they click "Add to Cart", **Then** the item is added to the cart, a visual confirmation appears (cart icon updates count), and the visitor can continue browsing.
2. **Given** a visitor has items in the cart, **When** they open the cart, **Then** they see each item with its name, image, quantity, price, and a running total.
3. **Given** a visitor is in the cart, **When** they update the quantity of an item, **Then** the quantity and total price update immediately without a page reload.
4. **Given** a visitor is in the cart, **When** they remove an item, **Then** the item disappears and the total recalculates.
5. **Given** a visitor clicks "Proceed to Checkout", **When** they are not logged in, **Then** they are prompted to log in or continue as a guest (guest checkout is supported).
6. **Given** a visitor is on the checkout page, **When** they fill in full name, delivery address, city, and phone number and click "Place Order", **Then** the order is submitted successfully and a confirmation screen is shown with an order summary.
7. **Given** a visitor places an order, **When** the order is confirmed, **Then** the cart is cleared automatically.
8. **Given** a visitor reaches checkout, **When** they view payment options, **Then** only "Cash on Delivery" is available — no card payment option is shown.

---

### User Story 3 — Create Account & Sign In (Priority: P2)

A customer creates an account to track their orders, or logs into their existing account. Once logged in, they see their name reflected in the header and can access their order history.

**Why this priority**: Account functionality enriches the experience and enables order tracking, but a guest can still purchase without it. P2 after core browsing and checkout.

**Independent Test**: Click "Register" → fill in name, email, password → account created and auto logged in → header shows the user's name → click "Login" on a fresh session → enter credentials → logged in successfully.

**Acceptance Scenarios**:

1. **Given** a visitor clicks "Register", **When** they fill in full name, valid email, and a password (minimum 8 characters) and submit, **Then** their account is created and they are immediately logged in without a separate login step.
2. **Given** a visitor tries to register with an email already in use, **When** they submit the form, **Then** a clear error message tells them the email is already registered.
3. **Given** a registered user clicks "Login", **When** they enter their correct email and password and submit, **Then** they are logged in and the header reflects their name.
4. **Given** a logged-in user clicks "Logout", **When** the action completes, **Then** they are logged out and the header reverts to showing Login/Register links.
5. **Given** a visitor submits the login form with wrong credentials, **When** the error is returned, **Then** a clear "Invalid email or password" message is shown without revealing which field is wrong.
6. **Given** an already logged-in user navigates to the Login or Register page, **When** the page loads, **Then** they are automatically redirected to the homepage.

---

### User Story 4 — View Order History (Priority: P2)

A logged-in customer can view all their past orders — what they ordered, when, and the delivery status.

**Why this priority**: Trust and transparency. Customers expect to track what they've bought. Requires account to be working first.

**Independent Test**: Log in → navigate to "My Orders" → see a list of past orders with product names, dates, quantities, totals, and status.

**Acceptance Scenarios**:

1. **Given** a logged-in user navigates to "My Orders", **When** the page loads, **Then** they see a chronological list of all their past orders.
2. **Given** a logged-in user has no past orders, **When** they open "My Orders", **Then** a friendly message is shown encouraging them to start shopping.
3. **Given** a visitor who is not logged in tries to access "My Orders", **When** the page loads, **Then** they are redirected to the Login page.
4. **Given** a logged-in user views an order in their history, **When** they look at the order card, **Then** they can see: order date, product name(s), quantity, total amount (PKR), and delivery status (e.g. Pending, Processing, Delivered).

---

### User Story 5 — Learn About the Brand & Get in Touch (Priority: P3)

A curious visitor navigates to the About page to learn the Irha Beauty brand story, or uses the Contact page to send an inquiry.

**Why this priority**: Builds brand trust and enables customer communication, but does not block purchasing.

**Independent Test**: Navigate to "About" → see brand story with imagery → navigate to "Contact" → fill in name, email, message → submit → see confirmation.

**Acceptance Scenarios**:

1. **Given** a visitor clicks "About" in the navigation, **When** the page loads, **Then** they see the brand story, values, and at least one visual element (image or styled text section).
2. **Given** a visitor is on the Contact page, **When** they fill in their name, email address, and message and click "Send", **Then** the form submits successfully and a confirmation message is displayed.
3. **Given** a visitor submits the contact form with an invalid email address, **When** they click "Send", **Then** a validation error is shown before submission.

---

### Edge Cases

- What happens when a visitor adds a product to cart and then the browser tab is closed and reopened? → Cart must still contain their items (persisted locally).
- What happens when a visitor navigates to a category that does not exist (e.g. `/categories/makeup`)? → A "Page Not Found" message is shown.
- What happens when the network is slow and images are loading? → Skeleton placeholders or blur-up image loading is shown so the layout does not jump.
- What happens when the product is out of stock? → "Out of Stock" state is shown on the product card and the "Add to Cart" button is disabled. (Note: no stock management in this phase — assume all products are in stock.)
- What happens when a visitor resizes the browser from desktop to mobile? → The layout reflows correctly at all breakpoints with no broken elements.
- What happens when a form is submitted with empty required fields? → Inline validation messages appear on each empty required field.

---

## Requirements *(mandatory)*

### Functional Requirements

**Homepage**
- **FR-001**: The homepage MUST display a full-screen hero carousel with three slides (Oils, Shampoo, Fragrance), each with its own banner image and an animated "Discover Now" button.
- **FR-002**: The hero carousel MUST auto-advance every 4 seconds with animated transitions between slides. Manual navigation (dots/arrows) MUST also be available.
- **FR-003**: Each "Discover Now" button MUST link to its respective category page (`/categories/oils`, `/categories/shampoo`, `/categories/fragrance`).
- **FR-004**: The homepage MUST display a categories grid showing all three categories with representative images and titles.
- **FR-005**: The homepage MUST display a featured products section showcasing the available product(s).
- **FR-006**: Every section on the homepage MUST animate into view as the user scrolls down — nothing is pre-rendered visible.

**Categories & Products**
- **FR-007**: The Shampoo category page MUST display a grid of available products with image, name, and price.
- **FR-008**: The Oils and Fragrance category pages MUST display a "Coming Soon" state — visually designed, not a blank page.
- **FR-009**: Each product card MUST display a primary image by default and switch to a secondary (hover) image when the user hovers over the card.
- **FR-010**: Clicking a product card MUST navigate to the full product detail page.
- **FR-011**: The product detail page MUST display: product name, price (in PKR), full description, both product images (with hover/switch behaviour), and an "Add to Cart" button.

**Cart**
- **FR-012**: The cart MUST be accessible from the header on all pages via a cart icon showing the current item count.
- **FR-013**: The cart MUST persist between browser sessions (if the tab is closed and reopened, items remain).
- **FR-014**: The cart MUST allow updating quantities and removing items, with totals recalculating instantly.

**Checkout**
- **FR-015**: The checkout page MUST collect: full name, delivery address (street, city), and phone number.
- **FR-016**: The checkout page MUST show only "Cash on Delivery" as the payment method — no card fields.
- **FR-017**: On successful order placement, the customer MUST see an order confirmation screen with a summary of their order.
- **FR-018**: Guest checkout MUST be supported — a visitor does not need an account to place an order.

**Authentication**
- **FR-019**: The Register form MUST collect full name, email, and password (minimum 8 characters). Invalid inputs MUST show inline validation messages.
- **FR-020**: On successful registration, the user MUST be automatically logged in without a separate login step.
- **FR-021**: The Login form MUST accept email and password. Failed attempts MUST show a generic "Invalid email or password" message.
- **FR-022**: On logout, the session MUST be fully cleared and the user returned to the homepage.

**Animations (non-negotiable)**
- **FR-023**: Every page element (headings, images, cards, buttons, sections) MUST animate into view — either on page load (above the fold) or on scroll (below the fold).
- **FR-024**: Every image MUST have an entrance animation.
- **FR-025**: Page transitions MUST be animated — no instant hard cuts between routes.

**Navigation & Layout**
- **FR-026**: The header MUST be fixed/sticky — always visible while scrolling — and MUST contain: logo (left), navigation links (centre), and cart + account icons (right).
- **FR-027**: A scroll-to-top button MUST appear after the user scrolls 100px and smoothly returns the user to the top when clicked.
- **FR-028**: The footer MUST contain: quick links, category links, social media icons, and a newsletter signup field.
- **FR-029**: The site MUST be fully responsive across mobile (320px+), tablet (768px+), and desktop (1024px+).

**About & Contact**
- **FR-030**: The About page MUST tell the Irha Beauty brand story with at least one visual element.
- **FR-031**: The Contact page MUST include a form (name, email, message) with validation and a success confirmation on submit.

**Customer Reviews**
- **FR-032**: The homepage MUST include a Reviews section displaying real customer testimonials — each with reviewer photo, name, designation, star rating, and review text.
- **FR-033**: The Reviews section MUST auto-rotate every 5 seconds with animated transitions. Manual dot navigation MUST also be supported.

**Top Product Spotlight**
- **FR-034**: The homepage MUST include a "Top Product" spotlight section featuring the hero product (Irha's Oil Control Facewash) with full ingredients list, key benefits, and an Add to Cart call-to-action.
- **FR-035**: The Top Product section MUST use scroll-triggered entrance animations consistent with the rest of the page.

### Key Entities

- **Product**: Name, price (PKR), description, primary image, hover image, category, stock status
- **Category**: Name, slug (oils / fragrance / shampoo), status (active / coming-soon), banner image, category image
- **Cart Item**: Product reference, quantity, unit price
- **Order**: Customer name, delivery address, city, phone, list of items, total (PKR), status, date placed
- **User**: Full name, email, authentication status

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can find a product and add it to cart within 60 seconds of landing on the homepage.
- **SC-002**: A customer can complete the full checkout process (cart → delivery details → order confirmation) in under 3 minutes.
- **SC-003**: All page animations play smoothly with no visible lag or flickering on a standard laptop or mid-range mobile phone.
- **SC-004**: The hero carousel cycles through all three banners automatically without any user interaction required.
- **SC-005**: Every page loads its above-the-fold content and begins animations within 2 seconds on a standard broadband connection.
- **SC-006**: The site layout and all content are fully usable on screens as small as 320px wide.
- **SC-007**: A new user can register, be automatically logged in, and see their name in the header — all within a single uninterrupted flow.
- **SC-008**: Cart contents survive a full browser tab close and reopen with no loss of items.

---

## Assumptions

- All product data (name, price, description, images) is hardcoded or fetched from the existing Irha Beauty backend API running locally at port 8000.
- There is exactly one active product in Phase 4: Irha Argan Shampoo at PKR 1,800.
- Oils and Fragrance categories show "Coming Soon" — no products are listed under them.
- No payment gateway integration in this phase — Cash on Delivery only.
- No stock management — the single product is assumed always in stock.
- No email notifications for orders or registration in this phase.
- No admin panel in this phase — content is managed directly in the codebase.
- Customer reviews are hardcoded (name, designation, review text, photo) — no backend ratings system in this phase.
- Contact form submissions display a success message only — no backend email sending in this phase.
- Guest checkout is supported. Guests' orders are not linked to a user account.
- Wishlist is client-side only (localStorage) — no backend persistence in this phase.
- The brand logo image (`logo.png`), all banner images, and all product/category images will be provided by the client and placed in the application's static assets folder before or during development.

---

## Out of Scope (Phase 4)

- Stripe or any card payment gateway
- Admin dashboard or CMS
- Product search or filtering
- Backend-persisted product reviews and ratings (reviews are hardcoded in this phase)
- Wishlist backend persistence (localStorage only in this phase)
- Email notifications (order confirmation, welcome email)
- Multi-currency support
- Inventory / stock management
- Blog section
- Social login (Google, Facebook)
