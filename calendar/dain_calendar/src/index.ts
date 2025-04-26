import { z } from "zod";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import {
  defineDAINService,
  ToolConfig,
} from "@dainprotocol/service-sdk";

// --- Google Calendar Setup (Keep as is) ---
const setupGoogleCalendar = async () => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// --- Availability Check Logic (Keep as is) ---
const checkAvailability = async (startTime: Date, endTime: Date) => {
  const calendar = await setupGoogleCalendar();
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startTime.toISOString(),
    timeMax: endTime.toISOString(),
    singleEvents: true,
    maxResults: 1,
  });
  return !response.data.items || response.data.items.length === 0;
};

// --- Event Creation Logic (Keep as is) ---
const createCalendarEvent = async (summary: string, description: string, startTime: Date, endTime: Date) => {
  const calendar = await setupGoogleCalendar();
  const event = {
    summary,
    description,
    start: { dateTime: startTime.toISOString(), timeZone: 'America/Los_Angeles' },
    end: { dateTime: endTime.toISOString(), timeZone: 'America/Los_Angeles' },
  };
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return response.data;
};

// --- Find First Available Slot Logic (Keep as is, but ensure it returns date) ---
const findFirstAvailableSlot = async (date: Date, timezone = 'America/Los_Angeles') => {
  const workStartHour = 9;
  const workEndHour = 17;

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Skip weekends
    return null;
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(workStartHour, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(workEndHour, 0, 0, 0);

  let currentSlotStart = new Date(startOfDay);

  while (currentSlotStart < endOfDay) {
    const currentSlotEnd = new Date(currentSlotStart);
    currentSlotEnd.setMinutes(currentSlotStart.getMinutes() + 30);

    if (currentSlotEnd <= endOfDay) {
      // Check availability slightly ahead to avoid booking slots starting exactly now if processing takes time
      const checkStart = new Date(currentSlotStart);
      // Optional: Add a small buffer if needed, e.g., checkStart.setMinutes(checkStart.getMinutes() + 1);

      // Ensure we don't check slots that have already passed today
      if (checkStart < new Date()) {
          currentSlotStart.setMinutes(currentSlotStart.getMinutes() + 30);
          continue;
      }

      const isAvailable = await checkAvailability(checkStart, currentSlotEnd);
      if (isAvailable) {
        return { // Return the first available slot found
          start: currentSlotStart, // Use the original start time for booking
          end: currentSlotEnd,
          date: date, // Include the date the slot was found on
          formattedTime: `${currentSlotStart.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', timeZone: timezone
          })} - ${currentSlotEnd.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', timeZone: timezone
          })}`
        };
      }
    }
    currentSlotStart.setMinutes(currentSlotStart.getMinutes() + 30);
  }
  return null; // No slot found for this specific date
};


// --- The Only Tool: Schedule Next Available Meeting ---
const scheduleNextAvailableMeetingTool: ToolConfig = {
  id: "schedule-next-available-meeting", // Clear ID
  name: "Schedule Next Available Meeting",
  description: "Finds and schedules a 30-minute meeting in the very next available slot (weekdays 9 AM - 5 PM PT). Requires only a title.",
  input: z
    .object({
      title: z.string().describe("Title for the meeting"),
      description: z.string().optional().describe("Optional description for the meeting"),
    })
    .describe("Provide a title to book the next available 30-min slot."),
  output: z
    .object({
      success: z.boolean().describe("True if scheduling succeeded, false otherwise."),
      message: z.string().describe("Details about the outcome."),
      scheduledDate: z.string().optional().describe("Date of the scheduled meeting (YYYY-MM-DD)."),
      scheduledTime: z.string().optional().describe("Time slot of the scheduled meeting."),
      eventLink: z.string().optional().describe("Direct link to the Google Calendar event."),
    })
    .describe("Result of attempting to schedule the next available meeting."),
  pricing: { pricePerUse: 0, currency: "USD" }, // Standard pricing field
  handler: async ({ title, description = "" }, agentInfo, context) => {
    console.log(`Request received to schedule next available meeting for: "${title}"`);
    try {
      let currentDate = new Date();
      // Don't reset time to 00:00 if checking starts today, keep current time
      // currentDate.setHours(0, 0, 0, 0); 

      for (let i = 0; i < 30; i++) { // Limit search depth
        const dateString = currentDate.toISOString().split('T')[0];
        console.log(`Checking for available slots on: ${dateString}`);

        // Pass a copy of the date to avoid modification by findFirstAvailableSlot
        const firstSlot = await findFirstAvailableSlot(new Date(currentDate));

        if (firstSlot) {
          console.log(`Found slot: ${firstSlot.formattedTime} on ${dateString}. Booking...`);
          const event = await createCalendarEvent(
            title,
            description,
            firstSlot.start,
            firstSlot.end
          );
          const eventLink = event.htmlLink;
          console.log(`Booking successful. Event link: ${eventLink}`);
          return {
            text: `Success! Scheduled "${title}" for ${dateString} at ${firstSlot.formattedTime}. Link: ${eventLink || 'N/A'}`, // Simple text confirmation
            data: {
              success: true,
              message: `Meeting "${title}" scheduled successfully.`,
              scheduledDate: dateString,
              scheduledTime: firstSlot.formattedTime,
              eventLink: eventLink
            },
            ui: null // Required by type
          };
        }

        // No slot found today, advance to the next day (set time to 00:00:00 for subsequent days)
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0); 
      }

      // If loop completes without finding a slot
      console.log("No available slots found within the search range.");
      return {
        text: "Sorry, couldn't find an available 30-minute slot in the next 30 days.",
        data: { success: false, message: "No available slots found within the next 30 days." },
        ui: null
      };

    } catch (error) {
      console.error("Error scheduling next available meeting:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        text: `Error: Failed to schedule meeting. ${errorMessage}`,
        data: { success: false, message: `Scheduling failed: ${errorMessage}` },
        ui: null
      };
    }
  },
};

// --- DAIN Service Definition (Only one tool) ---
const dainService = defineDAINService({
  metadata: {
    title: "Auto Scheduler Service",
    description: "A simple service to automatically book the next available 30-minute meeting slot.",
    version: "2.0.0", // Major version change for simplification
    author: "Calendar Assistant",
    tags: ["calendar", "scheduling", "automatic", "next available"],
    logo: "https://cdn-icons-png.flaticon.com/512/2983/2983723.png"
  },
  identity: {
    apiKey: process.env.DAIN_API_KEY,
  },
  tools: [scheduleNextAvailableMeetingTool], // Only include the single tool
});

// --- Start the Service ---
const PORT = 3022; // Keep the defined port
dainService.startNode({ port: PORT }).then(({ address }) => {
  console.log(`Auto Scheduler DAIN Service is running at port: ${address().port}`);
}).catch(err => {
  console.error(`Failed to start DAIN service on port ${PORT}:`, err);
  process.exit(1);
});