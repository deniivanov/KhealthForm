/**
 * Mailer abstraction. v1 ships only a no-op implementation; plug in a real
 * provider (Resend, SES, SMTP, …) by implementing Mailer and returning it
 * from getMailer().
 */

export interface OrderConfirmationPayload {
    to: string;
    reference: string;
    memberName: string;
    teamName: string;
    formTitle: string;
    totalCents: number;
    lines: Array<{ productName: string; sizeLabel: string; quantity: number; unitPriceCents: number }>;
}

export interface Mailer {
    sendOrderConfirmation(payload: OrderConfirmationPayload): Promise<void>;
}

class NoopMailer implements Mailer {
    async sendOrderConfirmation(payload: OrderConfirmationPayload): Promise<void> {
        console.log(`[mailer:noop] order confirmation ${payload.reference} -> ${payload.to} (not sent)`);
    }
}

const mailer: Mailer = new NoopMailer();

export function getMailer(): Mailer {
    return mailer;
}
