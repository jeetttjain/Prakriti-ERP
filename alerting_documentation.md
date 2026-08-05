# Alerting Engine & Communication Integration — Documentation

## Alert Lifecycle (`SystemAlert.js`)
Located under `server/src/core/observability/alerts/alertEngine.js`.

```
[ Threshold Breach ] ──► [ SystemAlert Created (Active) ] ──► [ Dispatch via Communication Router ]
                                                                      │
                                                               (Admin Review)
                                                                      ▼
                                                            [ Status: Acknowledged ]
```

---

## Communication Engine Dispatch
Critical severity alerts (`severity = "CRITICAL"`) trigger `notificationRouter.send()` to notify operations staff via WhatsApp, Email, or SMS automatically.
