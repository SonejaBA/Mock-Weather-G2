# Even G2 Weather App

A small React and JavaScript prototype for the Even Realities G2 glasses, built with the Even Hub SDK.

## Current features

- Displays a day and its simulated high and low temperatures.
- Swipe up or down to move between weekdays.
- Tap to show or hide the detailed weather container.

The weather values are currently sample data.

## Run locally

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

In a second terminal, launch the Even Hub simulator:

```bash
npx evenhub-simulator http://localhost:5173
```

## Tech

- React
- JavaScript
- Vite
- `@evenrealities/even_hub_sdk`
