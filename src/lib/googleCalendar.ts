// src/lib/googleCalendar.ts

import type { Plan } from './types';

// Augment the global Window interface for gapi and google
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// --- Configuration ---
const GAPI_SCRIPT_ID = 'gapi-script';
const GIS_SCRIPT_ID = 'gis-script';
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GAPI_CLIENT_ID;

// --- Module State ---
let isGapiInitialized = false;
let isGisInitialized = false;
let tokenClient: any = null;

// This promise will be resolved once both libraries are fully loaded and initialized.
// Subsequent calls will wait for this promise instead of trying to re-initialize.
let initializationPromise: Promise<void> | null = null;

// --- Initialization Logic ---

function initialize() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      console.log("Starting Google API initialization...");

      if (!CLIENT_ID) {
        throw new Error("VITE_GAPI_CLIENT_ID is not configured in your .env file. Please check your configuration.");
      }

      await loadGapiScript();
      console.log("GAPI script loaded.");
      
      await loadGisScript();
      console.log("GIS script loaded.");
      
      console.log("Google API initialization complete.");
      resolve();
    } catch (error) {
      console.error("Critical error during Google API initialization:", error);
      reject(error);
    }
  });

  return initializationPromise;
}

function loadGapiScript() {
  return new Promise<void>((resolve, reject) => {
    if (isGapiInitialized) return resolve();

    const script = document.createElement('script');
    script.id = GAPI_SCRIPT_ID;
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          });
          isGapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = () => reject(new Error('Failed to load GAPI script.'));
    document.body.appendChild(script);
  });
}

function loadGisScript() {
  return new Promise<void>((resolve, reject) => {
    if (isGisInitialized) return resolve();

    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: () => {}, // This will be overridden for each request
        });
        isGisInitialized = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => reject(new Error('Failed to load GIS script.'));
    document.body.appendChild(script);
  });
}


// --- Core Authentication Flow (Rewritten for Robustness) ---

async function getAndSetAccessToken() {
  await initialize(); // Ensure everything is loaded first

  return new Promise<void>((resolve, reject) => {
    tokenClient.callback = (tokenResponse: any) => {
      if (tokenResponse.error) {
        console.error("Google Token Error:", tokenResponse.error);
        return reject(new Error(`Google Auth Error: ${tokenResponse.error}. Popups might be blocked.`));
      }
      
      // THE CRITICAL FIX: Apply the token to the GAPI client for API calls.
      window.gapi.client.setToken(tokenResponse);
      console.log("Access token successfully retrieved and set.");
      resolve();
    };

    // If GAPI has no valid token, prompt the user. 
    // Otherwise, attempt a silent token refresh.
    if (window.gapi.client.getToken() === null) {
      console.log("No token found, requesting user consent.");
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.log("Existing token found, attempting silent refresh.");
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

// --- Exported API Functions ---

export async function createCalendarEvent({ plan, startDateTime, endDateTime }: { plan: Plan; startDateTime: string; endDateTime: string; }) {
  await getAndSetAccessToken();

  const event = {
    'summary': plan.title,
    'description': `Lesson plan for ${plan.subject} - ${plan.topic}.`,
    'start': { 'dateTime': startDateTime, 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
    'end': { 'dateTime': endDateTime, 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
    'extendedProperties': { 'private': { 'planId': plan.id } }
  };

  const request = window.gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event,
  });

  return new Promise((resolve, reject) => {
    request.execute((response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

export async function listCalendarEvents() {
  await getAndSetAccessToken();
  
  const response = await window.gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 50,
    'orderBy': 'startTime',
  });
  
  return response.result.items;
}