# Provider-Agnostic Plugin Architecture — Technical Specification

## Subsystem Overview
Located under `server/src/core/communication/providers/providerRegistry.js`, the Provider Registry manages provider plugin instances per channel.

---

## Supported Provider Integrations

| Channel | Supported Providers | Primary Default |
| :--- | :--- | :--- |
| **WhatsApp** | Meta Cloud API, Twilio, Interakt, Gupshup, 360Dialog | Meta Cloud API |
| **Email** | SMTP, AWS SES, SendGrid, Resend, Mailgun | SendGrid / SMTP |
| **SMS** | MSG91, Twilio SMS, Fast2SMS, TextLocal | MSG91 |
| **Push** | Firebase FCM, Web Push, PWA Push | Firebase FCM |
| **In-App** | System Internal Notifications | System Notification |
| **Collaboration (Future)** | Telegram, Slack, MS Teams, Discord | Slack / Webhook |

---

## Failover Execution Chain

```
[ Primary Provider (MetaCloudAPI) ]
                │
         (Fails / Timeout)
                ▼
[ Secondary Provider (TwilioWhatsApp) ]
                │
         (Fails / Timeout)
                ▼
[ Fallback Channel (Email / SendGrid) ]
                │
                ▼
  [ Delivered / Logged in Outbox ]
```
