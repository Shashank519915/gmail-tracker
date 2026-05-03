# Gmail Pixel Tracker

A lightweight email open-tracking system built with a single HTML file and a Google Apps Script web app. When a recipient opens your email, a 1×1 transparent pixel fires a request to your Apps Script endpoint, which logs the events with timestamp, open count, and a rolling timeline: directly into a Google Sheet.

No third-party services. No subscriptions. Runs entirely on your own Google account.

> <img width="700" height="373" alt="Tracker HTML UI" src="https://github.com/user-attachments/assets/22cf5b1c-c9b2-41ff-a346-fb8d2c45bd87" />
> <img width="800" height="425" alt="Google Sheets Tracker Final" src="https://github.com/user-attachments/assets/cd07b958-57b3-46d8-8cff-80f0aa68db23" />


---

## How It Works

1. You enter a recipient's email and a note in the HTML tool, which copies a tracking pixel as formatted HTML.
2. You paste the pixel into the bottom of a Gmail draft before sending.
3. When the recipient opens the email, their mail client loads the pixel.
4. The Apps Script web app receives the request, identifies the recipient, and updates their row in the sheet.

---

## Project Structure

```
├── tracker.html       # Local UI for generating and copying the tracking pixel
└── Code.gs            # Google Apps Script source (deployed as a web app)
```

---

## Setup

### 1. Create the Google Sheet

Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet. Name the first sheet exactly:

```
Log
```

> <img width="600" height="25" alt="Sheet name" src="https://github.com/user-attachments/assets/9d1245b4-d53b-4217-a586-6f529d25630c" />


Add the following headers in row 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Email ID | Status | Total Opens | First Created | Last Ping | Locale | Timeline (Last 5) |

> **Screenshot — Sheet header setup**
> <img width="800" height="183" alt="Google Sheet header row setup" src="https://github.com/user-attachments/assets/f9b97801-9f10-486b-9062-80728064295b" />

---

### 2. Open Apps Script

From inside the spreadsheet, go to:

```
Extensions > Apps Script
```

> **Screenshot — Opening Apps Script from the menu**
> <img width="480" height="302" alt="Extensions - Apps Script menu" src="https://github.com/user-attachments/assets/8e593caa-e8f9-48fa-9f24-7a02abd79f5d" />

---

### 3. Paste the Script

Delete any existing code in `Code.gs` and paste the contents of `Code.gs` from this repository. You can also rename the project as per your convenience.

> **Screenshot — Apps Script editor with code pasted**
> <img width="800" height="219" alt="Apps Script editor" src="https://github.com/user-attachments/assets/cf2bec5e-4e93-49b2-a86d-9c72922ec4ce" />

---

### 4. Deploy as a Web App

Click **Deploy** in the top-right corner, then select **New deployment**.

> **Screenshot — Deploy > New deployment**
> <img width="480" height="343" alt="Deploy - New deployment" src="https://github.com/user-attachments/assets/20a8da7e-7f17-473b-a84c-5b9017ac4ca2" />

Configure the deployment as follows:

- **Type:** Web app
- **Execute as:** Me
- **Who has access:** Anyone

Click **Deploy** and authorize the permissions when prompted.

> **Screenshot — Deployment configuration panel**
> <img width="620" height="478" alt="Deployment settings" src="https://github.com/user-attachments/assets/2836ec58-33a7-4821-9f7b-ebfd8367512d" />

---

### 5. Copy the Web App URL

After deployment, Apps Script will show you a web app URL that looks like:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Copy this URL.

> **Screenshot — Web app URL after deployment**
> <img width="620" height="363" alt="Web app URL after deployment" src="https://github.com/user-attachments/assets/5cf7e831-9e28-4363-8f29-cc594fc749a7" />

---

### 6. Configure the HTML File

Open `tracker.html` in a text editor. Find this line:

```javascript
const webAppUrl = "https://script.google.com";
```

Replace the placeholder with your web app URL:

```javascript
const webAppUrl = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Save the file.

> **Screenshot — tracker.html open in browser**
> <img width="700" height="373" alt="Tracker HTML UI" src="https://github.com/user-attachments/assets/22cf5b1c-c9b2-41ff-a346-fb8d2c45bd87" />

---

## Usage

1. Open `tracker.html` in any browser (no server needed — it runs as a local file).
2. Enter the recipient's email address and an optional note.
3. Click **Copy Tracker Pixel**.
4. In Gmail, compose your email, then paste (`Ctrl+V` / `Cmd+V`) at the very bottom of the message body.
5. Send the email.

The pixel is invisible to the recipient. Once they open the email, their row will appear in the sheet.

---

## Reading the Sheet

| Column | Meaning |
|--------|---------|
| Email ID | Recipient email address plus the note label you set in the tracker |
| Status | `Scanning...` while pre-load pings are being filtered; `OPENED` once a confirmed open is detected |
| Total Opens | Confirmed open count (resets to 1 when status flips to OPENED) |
| First Created | Timestamp of the very first ping received |
| Last Ping | Timestamp of the most recent ping |
| Locale | Recipient locale detected at first ping |
| Timeline (Last 5) | Rolling log of the five most recent timestamps, newest first |

Row colors:

- **Yellow** — Scanning phase (pre-load or prefetch pings, not a confirmed open)
- **Green** — Confirmed open registered

---

## Reset Logic

Some mail clients (Gmail, Apple Mail) pre-fetch images when the email is delivered, not when it is read. The script distinguishes these prefetch pings from real opens:

- If the first ping arrives and no subsequent pings follow within 60 seconds, the row stays in `Scanning...` state.
- If a ping arrives more than 60 seconds after the first, the script treats it as a genuine open, resets the counter to 1, marks the row `OPENED`, and starts a fresh timeline.

This prevents false positives from automated image prefetching.

---

## Limitations

- Tracking pixels are blocked by mail clients that disable remote image loading by default (Outlook desktop, Hey, some privacy-focused clients). Opens will not be recorded for those recipients.
- Gmail's image proxy caches images server-side after the first load. Subsequent opens by the same recipient may not register reliably.
- This tool is intended for personal productivity use. Ensure any use complies with applicable laws regarding electronic tracking and recipient consent in your jurisdiction.

---

## Re-deploying After Code Changes

If you modify `Code.gs`, you must create a new deployment for changes to take effect. Go to:

```
Deploy > Manage deployments > Edit (pencil icon) > Version: New version > Deploy
```

The web app URL does not change between versions.

> **Screenshot — Manage deployments dropdown**
> <img width="480" height="328" alt="Manage deployments dropdown" src="https://github.com/user-attachments/assets/8eb05d4a-4493-4722-adc0-0318a68fa84b" />

> **Screenshot — Manage deployments panel**
> <img width="620" height="480" alt="Manage deployments panel" src="https://github.com/user-attachments/assets/f0549f84-ad82-4491-8f5d-039df8c495d4" />

---

## License

MIT
