# Heat Index and Heat Safety Plan

This is a lightweight browser app built around two high-temperature policy documents:

- `SOP_052 Working in High Temperatures`
- `Taxiway SOP - Working in High Temperatures 7.29.25`

## What it does

- Does not require login or browser location permissions
- Lets the user type a city and state, ZIP code, or street address
- Uses Open-Meteo geocoding to resolve the typed location, including ZIP-code lookups
- Pulls hourly forecast temperature and humidity from `weather.gov`
- Calculates heat index and applies OSHA-style risk bands
- Lets the user choose the active policy profile and changes instructions accordingly
- Shows all-role responsibilities and new or returning worker guidance automatically in the instructions
- Applies the `Southwest District` profile from `SOP_052` and the `Taxiway U` profile from the Taxiway SOP
- Includes an hour-by-hour forecast output that highlights when policy rules change
- Surfaces guidance for hydration, mandatory breaks, acclimatization, cooldown stations, approvals, and symptom response

## Run locally

From this folder:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- The app stores the last entered location and control selections in `localStorage` for convenience.
- The OSHA-NIOSH Heat Safety Tool remains the screening reference, but this app uses live weather data from the National Weather Service and calculates the heat index in-browser.
- OSHA notes that heat index is a screening tool. Direct sun, PPE, radiant heat, heavy work, and enclosed spaces can create higher actual risk than the weather feed shows.
