# WhatsApp Conversation Flow

This document outlines the step-by-step flow when a user clicks the WhatsApp icon on the TradeSolt website to book a service.

## 1. User Initiation
- **Action:** The customer clicks the WhatsApp icon on the TradeSolt frontend or dashboard.
- **Result:** This opens the WhatsApp application on their device, pre-configured to chat with the TradeSolt Business WhatsApp number.
- **Example:** The user types and sends a natural language message: *"I need a plumber tomorrow at 3 PM in Dhanmondi."*

## 2. Webhook Interception
- **Action:** WhatsApp (Meta) triggers a webhook event.
- **Result:** A POST request containing the message payload is sent to the backend's `/api/whatsapp/webhook` endpoint.
- **Handling:** The `whatsapp.controller.ts` receives the event and passes the normalized message (sender's phone, text, channel) to the `whatsapp.service.ts`.

## 3. Natural Language Processing (AI Service)
- **Action:** The backend uses `parseBookingIntentWithAI()` (`ai.service.ts`) to understand the user's request.
- **Result:** The service queries an LLM via OpenRouter (e.g., Llama 3.3 or Gemini) to parse the natural language into structured JSON.
- **Extraction:** 
  ```json
  {
    "intent": "BOOKING_REQUEST",
    "service": "plumber",
    "date": "2026-08-30",
    "time": "15:00",
    "location": "Dhanmondi"
  }
  ```
- **Fallback:** If details are missing, the AI returns a clarification prompt (e.g., *"Can you provide the location and time?"*).

## 4. Availability & Scheduling
- **Action:** `checkTraderAvailability()` (`scheduling.service.ts`) is called with the extracted parameters.
- **Result:** The system queries the database for available traders matching the required service and location, ensuring they have an open slot at the requested time (including a 30-minute travel buffer).

## 5. Booking Creation
- **Action:** If a trader is available, `processBookingRequest()` (`booking.service.ts`) creates a new record in the database.
- **Result:** A booking is created with status `PENDING_PAYMENT`.
- **Payment Link:** The system simultaneously generates a secure Stripe Checkout session URL via `createCheckoutSessionService()` (`payment.service.ts`).

## 6. AI Bot Response
- **Action:** The backend saves the generated response in the database chat history.
- **Result:** It then calls `sendWhatsAppTextMessage()` to send the reply back to the user via the WhatsApp Cloud API.
- **Message:** *"Great news! I have reserved a plumber slot in Dhanmondi on 2026-08-30 at 15:00 via WHATSAPP. Booking ID: 12345. Please complete payment using this link to confirm: [Stripe URL]"*

## 7. Customer Confirmation (Payment)
- **Action:** The user clicks the Stripe link provided in the WhatsApp chat.
- **Result:** They complete the payment on the Stripe checkout page. Once successful, Stripe fires a `checkout.session.completed` webhook to the backend, which automatically updates the booking status to `CONFIRMED`.
