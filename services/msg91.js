// services/msg91.js
const axios = require("axios");

const MSG91_URL = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

async function sendWhatsAppOtp({
  to,                      // "917411917211"
  code,                    // "123456"
  authkey = process.env.MSG91_AUTHKEY,
  integratedNumber = process.env.MSG91_INTEGRATED_NUMBER,
  templateName = process.env.MSG91_TEMPLATE_NAME,
  languageCode = process.env.MSG91_LANG_CODE || "En",
}) {
  // Map your template components. Adjust keys to match your template exactly.
  // Your example used body_1 and button_1 (URL button). Reuse that:
  const payload = {
    integrated_number: integratedNumber,
    content_type: "template",
    payload: {
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
          policy: "deterministic"
        },
        to_and_components: [
          {
            to: [to],
            components: {
              body_1: { type: "text", value: code },
              button_1: { subtype: "url", type: "text", value: code }
            }
          }
        ]
      },
      messaging_product: "whatsapp"
    }
  };

  const res = await axios.post(MSG91_URL, payload, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authkey
    },
    timeout: 15000
  });

  return res.data;
}

module.exports = { sendWhatsAppOtp };