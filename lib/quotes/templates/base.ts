import { Quote } from "@/lib/quotes/quote";

export function renderQuoteHTML(quote: Quote) {
  const rows = quote.items
    .map(
      (i) => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${i.label}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${i.quantity} ${i.unit}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">$${i.unitPrice.toFixed(2)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${i.total.toFixed(2)}</td>
        </tr>
      `
    )
    .join("\n");

  const recommended = (quote.recommendedItems || [])
    .map((i) => `<li>${i.label} — $${i.total.toFixed(2)}</li>`)
    .join("");

  return `
    <html>
      <body style="font-family:Inter,Arial,sans-serif; padding:24px; background:#f8fafc;">
        <div style="max-width:700px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
          <h1 style="margin:0 0 4px 0;font-size:22px;color:#0f172a;">Service Quote</h1>
          <p style="margin:0;color:#475569;">Service profile: ${quote.serviceProfile}</p>
          <p style="margin:8px 0 16px 0;color:#475569;">Quote ID: ${quote.id} · Version ${quote.version}</p>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th align="left" style="padding:6px;border-bottom:2px solid #0f172a;">Item</th>
                <th align="left" style="padding:6px;border-bottom:2px solid #0f172a;">Qty</th>
                <th align="left" style="padding:6px;border-bottom:2px solid #0f172a;">Rate</th>
                <th align="right" style="padding:6px;border-bottom:2px solid #0f172a;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="margin-top:16px;text-align:right;">
            <p style="margin:4px 0;color:#334155;">Subtotal: <strong>$${quote.subtotal.toFixed(2)}</strong></p>
            <p style="margin:4px 0;color:#334155;">Tax: <strong>$${quote.tax.toFixed(2)}</strong></p>
            <p style="margin:8px 0;color:#0f172a;font-size:18px;">Total: <strong>$${quote.total.toFixed(2)}</strong></p>
          </div>

          ${quote.notes ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;"><strong>Notes</strong><p style="margin:6px 0;color:#475569;">${quote.notes}</p></div>` : ""}
          ${recommended ? `<div style="margin-top:12px;"><strong>Recommended add-ons</strong><ul>${recommended}</ul></div>` : ""}
        </div>
      </body>
    </html>
  `;
}
