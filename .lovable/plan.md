

# "Leave a Suggestion" Feedback Form

## What It Does
A dialog button in the footer (between "Buy me a coffee" and "Built with intention") that opens a form collecting name/nickname, email, and message. Submissions are sent to your email without exposing it to users.

## Email Delivery Approach
Since there's no backend, I'll use **Web3Forms** — a free, no-signup-needed service that works client-side. It sends form data to your email via an access key (public, safe to embed). You'll need to:
1. Go to https://web3forms.com and enter `howen0717@outlook.com`
2. You'll receive an access key via email
3. Paste it into the code

Alternatively, I can use **EmailJS** which works similarly. Both hide your email from users.

## Technical Changes

### 1. New `SuggestionForm.tsx`
- Dialog with trigger button styled like the CoffeeTreat (muted text, small icon)
- Form fields: Name/Nickname, Email, Message
- Submit via `fetch` to `https://api.web3forms.com/submit` with the access key
- Toast notification on success/failure
- Loading state on submit button

### 2. `Index.tsx`
- Import and place `<SuggestionForm />` between `<CoffeeTreat />` and the "Built with intention" text

### Button/Form Design
- Trigger: `💬 Leave a suggestion` — same style as coffee button
- Form inside Dialog with clean, minimal styling matching the app's aesthetic

