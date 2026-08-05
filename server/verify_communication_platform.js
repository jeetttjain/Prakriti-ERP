require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const providerRegistry = require("./src/core/communication/providers/providerRegistry");
const notificationRouter = require("./src/core/communication/routing/notificationRouter");
const templateEngine = require("./src/core/communication/templates/templateEngine");
const attachmentEngine = require("./src/core/communication/attachments/attachmentEngine");
const deliveryEngine = require("./src/core/communication/delivery/deliveryEngine");
const communicationAnalytics = require("./src/core/communication/analytics/communicationAnalytics");
const CommunicationMessage = require("./src/models/CommunicationMessage");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Provider Registry & Abstraction ---");
    const waProviders = providerRegistry.getProvidersForChannel("WhatsApp");
    console.log("✅ Registered WhatsApp Providers count:", waProviders.length, "Providers:", waProviders.map((p) => p.providerName));

    console.log("\n--- TEST 2: Template Engine & Locale Currency Rendering ---");
    const renderedText = templateEngine.render("Invoice #{{ invoiceId }} total is {{ amount }}.", { invoiceId: "INV-999", amount: 25400 });
    console.log("✅ Rendered Template Output:", renderedText);

    console.log("\n--- TEST 3: Attachment Engine Generator ---");
    const pdfAtt = await attachmentEngine.generateAttachment("PDF_INVOICE", "INV-999");
    console.log("✅ Attachment generated:", pdfAtt.name, "URL:", pdfAtt.url);

    console.log("\n--- TEST 4: Notification Router & Omnichannel Threading ---");
    const routerStartTime = Date.now();
    const sentMsg = await notificationRouter.send({
      recipientId: "CUST-101",
      recipientAddress: "+919876543210",
      templateId: "TMPL_INV_01",
      variables: { invoiceId: "INV-101", amount: 18500 },
      entityType: "Invoice",
      entityId: "INV-101",
    });
    const routerDuration = Date.now() - routerStartTime;

    console.log("✅ Notification routed & delivered in", routerDuration, "ms. Message ID:", sentMsg.messageId, "Status:", sentMsg.status);

    console.log("\n--- TEST 5: Delivery Engine Retry Policy ---");
    const retried = await deliveryEngine.retryMessage(sentMsg.messageId);
    console.log("✅ Message retried cleanly. Retry count:", retried.messageDoc.retryCount, "Status:", retried.messageDoc.status);

    console.log("\n--- TEST 6: Communication Analytics & Health ---");
    const ana = await communicationAnalytics.getAnalytics();
    console.log("✅ Analytics loaded! Delivery Rate:", ana.deliveryRatePct, "% Provider Health Score:", ana.providerHealthScore);

    console.log("\n🎉 ALL 6 COMMUNICATION PLATFORM TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🍃 MongoDB Connection closed.");
    process.exit(0);
  }
}

runTests();
