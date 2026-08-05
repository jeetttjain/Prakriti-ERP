# Template Engine & Localization — Documentation

## Engine Features
The Template Engine (`server/src/core/communication/templates/templateEngine.js`) manages multi-lingual templates stored in MongoDB (`CommunicationTemplate` collection).

---

## Capabilities
1. **Variable Substitution**: Replaces `{{ variable }}` tags with runtime data.
2. **Locale Formatting**: Formats currency fields (e.g. `amount` $\rightarrow$ `₹25,400.00`) automatically based on target locale (`en-IN`, `hi-IN`).
3. **Multi-lingual Support**: Supports `en`, `hi`, `mr`, `ta`, `te` language codes.
4. **Approval Workflow**: Bulk & marketing templates require `Approved` status before campaign publishing.
5. **Fallback Channels**: Defines fallback channels (e.g. WhatsApp $\rightarrow$ Email).
