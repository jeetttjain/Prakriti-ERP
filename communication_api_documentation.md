# Communication Platform — API Reference

## Endpoints Specifications (`/api/communication/*`)

### 1. `GET /api/communication/messages`
Returns outbox message history and lifecycle statuses.

### 2. `GET /api/communication/conversations`
Returns omnichannel conversation threads with timeline histories.

### 3. `GET /api/communication/templates`
Returns registered multi-lingual templates.

### 4. `GET /api/communication/providers`
Returns provider registry configuration and priority ranks.

### 5. `GET /api/communication/preferences`
Returns target communication preferences.

### 6. `GET /api/communication/analytics`
Returns delivery rate %, read rate %, failure rate %, and provider health scorecards.

### 7. `POST /api/communication/send`
Dispatches a communication request via Communication Router.

### 8. `POST /api/communication/template`
Creates a new message template.

### 9. `POST /api/communication/provider`
Registers a new communication provider configuration.

### 10. `POST /api/communication/campaign`
Creates a new communication campaign.

### 11. `PATCH /api/communication/retry/:id`
Manually retries a failed message.

### 12. `PATCH /api/communication/cancel/:id`
Cancels a queued or scheduled message.

### 13. `PATCH /api/communication/approve/:id`
Approves a template for campaign usage.
