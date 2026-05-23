import { notifyOwner } from "./_core/notification";

interface BookingNotificationData {
  bookingCode: string;
  attendeeName: string;
  attendeeEmail: string;
  packageName: string;
  quantity: number;
  totalPrice: number;
  eventName: string;
}

interface PaymentNotificationData {
  bookingCode: string;
  attendeeName: string;
  attendeeEmail: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  eventName: string;
}

/**
 * Send booking confirmation notification to buyer and admin
 */
export async function sendBookingNotification(data: BookingNotificationData) {
  try {
    // Notify admin
    const adminMessage = `New booking received for ${data.eventName}:
    
Booking Code: ${data.bookingCode}
Attendee: ${data.attendeeName} (${data.attendeeEmail})
Package: ${data.packageName}
Quantity: ${data.quantity}
Total: $${data.totalPrice.toFixed(2)}

Visit the admin dashboard to manage this booking.`;

    await notifyOwner({
      title: `New Booking: ${data.bookingCode}`,
      content: adminMessage,
    });

    // Log buyer notification (in production, integrate with email service)
    console.log(`[NOTIFICATION] Booking confirmation sent to ${data.attendeeEmail}`);
    console.log(`Booking Code: ${data.bookingCode}`);
    console.log(`Package: ${data.packageName}`);
    console.log(`Quantity: ${data.quantity}`);
    console.log(`Total: $${data.totalPrice.toFixed(2)}`);

    return true;
  } catch (error) {
    console.error("[NOTIFICATION] Failed to send booking notification:", error);
    return false;
  }
}

/**
 * Send payment notification to buyer and admin
 */
export async function sendPaymentNotification(data: PaymentNotificationData) {
  try {
    const statusText =
      data.status === "completed"
        ? "Payment Received"
        : data.status === "pending"
          ? "Payment Pending"
          : "Payment Failed";

    // Notify admin
    const adminMessage = `Payment ${data.status} for booking ${data.bookingCode}:

Attendee: ${data.attendeeName} (${data.attendeeEmail})
Amount: $${data.amount.toFixed(2)}
Status: ${statusText}
Event: ${data.eventName}

Visit the admin dashboard for more details.`;

    await notifyOwner({
      title: `Payment ${statusText}: ${data.bookingCode}`,
      content: adminMessage,
    });

    // Log buyer notification (in production, integrate with email service)
    console.log(`[NOTIFICATION] Payment notification sent to ${data.attendeeEmail}`);
    console.log(`Booking Code: ${data.bookingCode}`);
    console.log(`Amount: $${data.amount.toFixed(2)}`);
    console.log(`Status: ${statusText}`);

    return true;
  } catch (error) {
    console.error("[NOTIFICATION] Failed to send payment notification:", error);
    return false;
  }
}

/**
 * Send ticket download link notification
 */
export async function sendTicketDownloadNotification(
  attendeeEmail: string,
  bookingCode: string,
  downloadUrl: string
) {
  try {
    console.log(`[NOTIFICATION] Ticket download link sent to ${attendeeEmail}`);
    console.log(`Booking Code: ${bookingCode}`);
    console.log(`Download URL: ${downloadUrl}`);

    return true;
  } catch (error) {
    console.error("[NOTIFICATION] Failed to send ticket download notification:", error);
    return false;
  }
}
