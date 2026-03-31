const STORAGE_KEY = "heat-app-preferences";

const symptomLibrary = [
  {
    title: "Heat Cramps",
    signs: "Painful muscle cramps or spasms during or after sweating in high heat.",
    actions: "Move to a cool area, drink water and electrolytes, and report symptoms immediately.",
  },
  {
    title: "Heat Exhaustion",
    signs: "Headache, nausea, dizziness, weakness, irritability, thirst, heavy sweating, elevated body temperature.",
    actions: "Get to shade or cooling trailer, loosen gear when safe, hydrate, and contact medical support quickly.",
  },
  {
    title: "Heat Stroke",
    signs: "Confusion, loss of consciousness, seizure, rapidly rising body temperature, altered mental status.",
    actions: "Call 911 immediately. Move the worker to a cool environment and begin rapid cooling while waiting for EMS.",
  },
];

const universalRoleGuidance = {
  all: [
    "All workers must report heat symptoms in themselves or coworkers immediately and use shade or cooldown areas any time early symptoms appear.",
    "Foremen must monitor crew condition, enforce breaks, verify water and electrolytes are stocked, and perform peer checks.",
    "Superintendents must verify hydration support, break schedules, and shade or break areas are in place before work begins.",
    "Project safety and project management must communicate the current heat threat and verify the active controls are being followed.",
  ],
  district: [
    "Under the Southwest District profile, the Project Safety Manager should communicate the OSHA heat index risk before each shift starts.",
    "District and project leadership should reclassify the day if forecast conditions materially change.",
  ],
  taxiway: [
    "Under the Taxiway U profile, project management may reevaluate crews individually and shut down operations early when conditions warrant.",
    "Superintendent and foreman shall verify the crew is fit to work and allow crews to cool down whenever needed.",
  ],
};

const districtGuidanceBlocks = {
  minimal: {
    title: "Minimal Risk",
    items: [
      "Employees shall be trained in the signs and symptoms of heat illness.",
      "Continue normal hydration support and supervisor monitoring.",
      "Use the OSHA or NIOSH heat app to keep checking conditions as the day changes.",
    ],
  },
  low: {
    title: "Low Risk",
    items: [
      "Implement hourly mandatory hydration breaks.",
      "Keep hydration stations available in the work area.",
      "Continue monitoring in case changing forecast conditions require reclassification.",
    ],
  },
  moderate: {
    title: "Moderate Risk",
    items: [
      "Start shifts as early as possible when practical.",
      "Implement hourly mandatory hydration breaks.",
      "Provide shade or break rooms to craftsmen.",
      "Increase monitoring where conditions include radiant heat, humidity, or limited air movement.",
    ],
  },
  high: {
    title: "High Risk",
    items: [
      "Limit workdays to 10 hours maximum.",
      "Start shifts as early as possible to limit afternoon exposure.",
      "Implement hourly mandatory hydration breaks.",
      "Keep shade or breakrooms accessible to craftsmen.",
      "Any work over 10 hours must be approved by the Safety District Manager.",
    ],
  },
  extreme: {
    title: "Extreme Risk",
    items: [
      "Limit workdays to 8 hours.",
      "Start shifts as early as possible to limit afternoon exposure.",
      "Implement hourly mandatory hydration breaks.",
      "Keep shade or breakrooms accessible to craftsmen.",
      "Any work over 8 hours must be approved by the Safety District Manager.",
    ],
  },
};

const taxiwayGuidanceBlocks = {
  standard: {
    title: "Standard Taxiway Controls",
    items: [
      "Provide a hydration station with shade, ice water, and hydration products in the work area.",
      "Each employee should take roughly a 5-minute cooldown break every 30 minutes.",
      "Each employee is required to drink at least 2 bottles of water per hour.",
      "Superintendent and foreman must verify crews are fit to work and allow extra breaks when needed.",
      "Start shifts as early as possible and no later than 6:00 AM to finish before the 2:00 PM to 4:00 PM peak heat window.",
    ],
  },
  ninetyFive: {
    title: "Taxiway 95 to 104",
    items: [
      "Breaks every 30 minutes are mandatory.",
      "Misting fans and mandatory shade are required.",
      "Hydration packs or electrolytes are required.",
      "Coolers with fruit or ice pops and swamp cooler or misting fan should be present at 95 heat index.",
      "Crews working above 95 without controls may be written up and shut down.",
    ],
  },
  oneOhFive: {
    title: "Taxiway 105 to 109",
    items: [
      "Crews may work no more than 2 consecutive hours in this range.",
      "An early shift end is mandatory unless an alternative shift is scheduled.",
      "Any work over 10 hours requires management approval from the CM or PM.",
    ],
  },
  oneTen: {
    title: "Taxiway 110 and Above",
    items: [
      "Shut down all operations when this heat index is reached.",
      "Failure to comply requires immediate stop work and retraining.",
    ],
  },
};

const policyLabels = {
  sop052: "Southwest District",
  taxiway: "Taxiway U",
};

const locationForm = document.getElementById("locationForm");
const locationInput = document.getElementById("locationInput");
const lookupButton = document.getElementById("lookupButton");
const openLookupModalButton = document.getElementById("openLookupModalButton");
const closeLookupModalButton = document.getElementById("closeLookupModalButton");
const lookupModal = document.getElementById("lookupModal");
const lookupModalBackdrop = document.getElementById("lookupModalBackdrop");
const refreshButton = document.getElementById("refreshButton");
const lookupMessage = document.getElementById("lookupMessage");
const welcomeTitle = document.getElementById("welcomeTitle");
const statusBanner = document.getElementById("statusBanner");
const forecastDayField = document.getElementById("forecastDayField");
const forecastDaySelect = document.getElementById("forecastDaySelect");
const policySelect = document.getElementById("policySelect");
const sunSelect = document.getElementById("sunSelect");
const temperatureValue = document.getElementById("temperatureValue");
const humidityValue = document.getElementById("humidityValue");
const heatIndexValue = document.getElementById("heatIndexValue");
const riskLevelValue = document.getElementById("riskLevelValue");
const locationValue = document.getElementById("locationValue");
const currentTimeValue = document.getElementById("currentTimeValue");
const updatedValue = document.getElementById("updatedValue");
const sourceValue = document.getElementById("sourceValue");
const timelineContent = document.getElementById("timelineContent");
const timelinePrevButton = document.getElementById("timelinePrevButton");
const timelineNextButton = document.getElementById("timelineNextButton");
const timelineSlider = document.getElementById("timelineSlider");
const timelineSliderMarkers = document.getElementById("timelineSliderMarkers");
const timelineSliderLabels = document.getElementById("timelineSliderLabels");
const timelineSliderHint = document.getElementById("timelineSliderHint");
const timelinePositionValue = document.getElementById("timelinePositionValue");
const timelineCountValue = document.getElementById("timelineCountValue");
const timelineTemplate = document.getElementById("timelineTemplate");
const symptomTemplate = document.getElementById("symptomTemplate");
const symptomGrid = document.getElementById("symptomGrid");

let lastWeatherPayload = null;
let lastResolvedQuery = "";
let timelineEntries = [];
let activeTimelineIndex = 0;

renderSymptoms();
restorePreferences();
renderIdleState();
updateCurrentTimeDiagnostic();
window.setInterval(updateCurrentTimeDiagnostic, 60000);

locationForm.addEventListener("submit", handleLocationSubmit);
openLookupModalButton.addEventListener("click", openLookupModal);
closeLookupModalButton.addEventListener("click", closeLookupModal);
lookupModalBackdrop.addEventListener("click", closeLookupModal);
refreshButton.addEventListener("click", handleRefresh);
forecastDaySelect.addEventListener("change", handlePreferenceChange);
policySelect.addEventListener("change", handlePreferenceChange);
sunSelect.addEventListener("change", handlePreferenceChange);
timelinePrevButton.addEventListener("click", () => stepTimeline(-1));
timelineNextButton.addEventListener("click", () => stepTimeline(1));
timelineSlider.addEventListener("input", handleTimelineSliderInput);
document.addEventListener("keydown", handleGlobalKeydown);

function loadPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function savePreferences(preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function restorePreferences() {
  const preferences = loadPreferences();
  locationInput.value = preferences.locationQuery ?? "";
  forecastDaySelect.value = preferences.forecastDay ?? "today";
  policySelect.value = preferences.policy ?? "sop052";
  sunSelect.value = preferences.sun ?? "sun";
}

function handlePreferenceChange() {
  savePreferences({
    locationQuery: locationInput.value.trim(),
    forecastDay: forecastDaySelect.value,
    policy: policySelect.value,
    workload: "moderate",
    sun: sunSelect.value,
  });

  if (lastWeatherPayload) {
    renderWeatherResult(lastWeatherPayload);
  }
}

async function handleLocationSubmit(event) {
  event.preventDefault();
  const query = locationInput.value.trim();
  if (!query) {
    statusBanner.className = "status-banner risk-high";
    statusBanner.textContent = "Enter a city and state, ZIP code, or street address to look up conditions.";
    return;
  }

  await lookupWeather(query);
}

async function handleRefresh() {
  const query = lastResolvedQuery || locationInput.value.trim();
  if (!query) {
    statusBanner.className = "status-banner risk-high";
    statusBanner.textContent = "Enter a location first, then refresh conditions.";
    return;
  }

  await lookupWeather(query);
}

async function lookupWeather(query) {
  setLoadingState(`Finding "${query}" and loading current heat conditions...`);
  lookupButton.disabled = true;
  refreshButton.disabled = true;

  try {
    savePreferences({
      locationQuery: query,
      forecastDay: forecastDaySelect.value,
      policy: policySelect.value,
      workload: "moderate",
      sun: sunSelect.value,
    });

    const resolvedLocation = await geocodeLocation(query);
    const weatherData = await fetchWeatherForPosition(resolvedLocation.latitude, resolvedLocation.longitude);
    lastResolvedQuery = query;
    lastWeatherPayload = {
      ...weatherData,
      resolvedLabel: resolvedLocation.label,
    };
    renderWeatherResult(lastWeatherPayload);
    closeLookupModal();
  } catch (error) {
    statusBanner.className = "status-banner risk-high";
    statusBanner.textContent = error.message || "Unable to load heat conditions for that location.";
  } finally {
    lookupButton.disabled = false;
    refreshButton.disabled = false;
  }
}

function openLookupModal() {
  lookupModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  window.setTimeout(() => {
    locationInput.focus();
    locationInput.select();
  }, 0);
}

function closeLookupModal() {
  lookupModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && !lookupModal.classList.contains("hidden")) {
    closeLookupModal();
  }
}

function renderIdleState() {
  welcomeTitle.textContent = "Enter a location to start monitoring";
  lookupMessage.textContent = "Type a city and state, ZIP code, or street address to load conditions.";
  statusBanner.className = "status-banner";
  statusBanner.textContent = "Type a city and state, ZIP code, or street address to load heat conditions.";
  forecastDayField.classList.remove("hidden");
  timelineEntries = [];
  activeTimelineIndex = 0;
  timelineContent.innerHTML = '<p class="empty-state">Enter a location to see when policy rules change hour by hour.</p>';
  updateTimelineControls();
  setMetricValues("--", "--", "--", "--");
  locationValue.textContent = "Not loaded";
  updatedValue.textContent = "--";
  sourceValue.textContent = "--";
}

function updateCurrentTimeDiagnostic() {
  currentTimeValue.textContent = new Date().toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function setLoadingState(message) {
  welcomeTitle.textContent = "Loading heat conditions";
  statusBanner.className = "status-banner";
  statusBanner.textContent = message;
}

async function geocodeLocation(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=5&language=en&format=json&countryCode=US`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not reach the address lookup service.");
  }

  const data = await response.json();
  const results = data.results ?? [];
  const match = results.find((entry) => entry.country_code === "US") ?? results[0];

  if (!match) {
    throw new Error("No matching location was found. Try a fuller city/state or ZIP entry.");
  }

  return {
    label: buildResolvedLabel(match),
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

function buildResolvedLabel(match) {
  const parts = [match.name, match.admin1, match.country_code].filter(Boolean);
  return parts.join(", ");
}

async function fetchWeatherForPosition(latitude, longitude) {
  const pointsResponse = await fetch(`https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`, {
    headers: { Accept: "application/geo+json" },
  });

  if (!pointsResponse.ok) {
    throw new Error("Could not reach the National Weather Service grid service.");
  }

  const pointsData = await pointsResponse.json();
  const forecastUrl = pointsData.properties?.forecastHourly;
  const city = pointsData.properties?.relativeLocation?.properties?.city;
  const state = pointsData.properties?.relativeLocation?.properties?.state;

  if (!forecastUrl) {
    throw new Error("No hourly forecast was returned for this location.");
  }

  const forecastResponse = await fetch(forecastUrl, {
    headers: { Accept: "application/geo+json" },
  });

  if (!forecastResponse.ok) {
    throw new Error("Could not load hourly heat conditions.");
  }

  const forecastData = await forecastResponse.json();
  const currentPeriod = forecastData.properties?.periods?.[0];
  const hourlyPeriods = forecastData.properties?.periods?.slice(0, 48) ?? [];

  if (!currentPeriod) {
    throw new Error("The hourly forecast did not contain a usable observation.");
  }

  const temperatureF = currentPeriod.temperatureUnit === "F"
    ? currentPeriod.temperature
    : celsiusToFahrenheit(currentPeriod.temperature);
  const humidity = currentPeriod.relativeHumidity?.value;

  if (typeof temperatureF !== "number" || typeof humidity !== "number") {
    throw new Error("The hourly forecast did not include temperature and humidity together.");
  }

  return {
    city,
    state,
    latitude,
    longitude,
    updatedAt: currentPeriod.startTime,
    temperatureF,
    humidity,
    shortForecast: currentPeriod.shortForecast,
    hourlyPeriods,
    sourceLabel: "weather.gov hourly forecast",
  };
}

function renderWeatherResult(payload) {
  const forecastDay = updateForecastDayAvailability(payload.hourlyPeriods);
  const policy = policySelect.value;
  const directSun = sunSelect.value === "sun";
  const selectedPeriods = getSelectedForecastPeriods(payload.hourlyPeriods, forecastDay);
  const summary = buildForecastSummary(selectedPeriods, directSun);

  if (!summary) {
    welcomeTitle.textContent = payload.resolvedLabel || "Heat conditions loaded";
    lookupMessage.textContent = "Change the location, day, or refresh to update conditions.";
    statusBanner.className = "status-banner risk-high";
    statusBanner.textContent = `No ${forecastDay} forecast hours were available for this location.`;
    timelineEntries = [];
    activeTimelineIndex = 0;
    timelineContent.innerHTML = `<p class="empty-state">No ${forecastDay} forecast hours were available for this location.</p>`;
    updateTimelineControls();
    setMetricValues("--", "--", "--", "--");
    locationValue.textContent = payload.resolvedLabel || "Not loaded";
    updatedValue.textContent = "--";
    sourceValue.textContent = "--";
    return;
  }

  const oshaRisk = classifyOshaRisk(summary.adjustedHeatIndex);
  const policyRisk = classifyPolicyRisk(summary.adjustedHeatIndex, policy);
  welcomeTitle.textContent = payload.resolvedLabel || "Heat conditions loaded";
  lookupMessage.textContent = "Change the location, day, or refresh to update conditions.";
  setMetricValues(
    `${Math.round(summary.temperatureF)}°F`,
    `${Math.round(summary.humidity)}%`,
    `${Math.round(summary.adjustedHeatIndex)}°F`,
    `${oshaRisk.label} / ${policyRisk.label}`,
  );

  locationValue.textContent = payload.resolvedLabel || (payload.city && payload.state
    ? `${payload.city}, ${payload.state}`
    : `${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`);
  updatedValue.textContent = new Date(payload.updatedAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  sourceValue.textContent = new Date(summary.period.startTime).toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  statusBanner.className = `status-banner ${policyRisk.bannerClass}`;
  statusBanner.textContent = `${formatForecastDayLabel(forecastDay)} ${policyRisk.label}: ${policyRisk.summary} ${directSun ? "Direct sunlight adjustment of +15°F applied." : ""}`;

  riskLevelValue.textContent = `${oshaRisk.label} / ${policyRisk.label}`;
  renderHourlyTimeline(payload);
}

function renderHourlyTimeline(payload) {
  const forecastDay = forecastDaySelect.value;
  const policy = policySelect.value;
  const directSun = sunSelect.value === "sun";
  const periods = getSelectedForecastPeriods(payload.hourlyPeriods, forecastDay);

  if (!periods.length) {
    timelineEntries = [];
    activeTimelineIndex = 0;
    timelineContent.innerHTML = `<p class="empty-state">No ${forecastDay} forecast hours were available for this location.</p>`;
    updateTimelineControls();
    return;
  }

  let previousPolicyKey = null;
  const nextEntries = [];

  periods.forEach((period) => {
    const temperatureF = period.temperatureUnit === "F"
      ? period.temperature
      : celsiusToFahrenheit(period.temperature);
    const humidity = period.relativeHumidity?.value;

    if (typeof temperatureF !== "number" || typeof humidity !== "number") {
      return;
    }

    const heatIndex = calculateHeatIndex(temperatureF, humidity);
    const adjustedHeatIndex = directSun ? heatIndex + 15 : heatIndex;
    const policyRisk = classifyPolicyRisk(adjustedHeatIndex, policy);
    const oshaRisk = classifyOshaRisk(adjustedHeatIndex);
    const hasPolicyChange = previousPolicyKey !== null && previousPolicyKey !== policyRisk.key;
    previousPolicyKey = policyRisk.key;

    nextEntries.push({
      period,
      temperatureF,
      humidity,
      adjustedHeatIndex,
      oshaRisk,
      hasPolicyChange,
      badgeLabel: buildBadgeLabel(policy, policyRisk.key),
      badgeClass: getBadgeClass(policy, policyRisk.key),
      workload,
      actions: buildHourlyActions(policy, policyRisk.key, adjustedHeatIndex, hasPolicyChange),
      metrics: [
        `Temp ${Math.round(temperatureF)}°F`,
        `Humidity ${Math.round(humidity)}%`,
        `Heat Index ${Math.round(adjustedHeatIndex)}°F`,
        `OSHA ${oshaRisk.label}`,
        `Workload ${workload}`,
      ],
    });
  });

  timelineEntries = nextEntries;

  if (!timelineEntries.length) {
    timelineContent.innerHTML = '<p class="empty-state">Hourly forecast data was not available for this location.</p>';
    activeTimelineIndex = 0;
    updateTimelineControls();
    return;
  }

  activeTimelineIndex = getDefaultTimelineIndex(timelineEntries);
  renderTimelineCard();
}

function getDefaultTimelineIndex(entries) {
  const now = Date.now();
  const nextIndex = entries.findIndex((entry) => new Date(entry.period.startTime).getTime() >= now);
  return nextIndex >= 0 ? nextIndex : 0;
}

function stepTimeline(step) {
  if (!timelineEntries.length) {
    return;
  }

  const nextIndex = Math.max(0, Math.min(timelineEntries.length - 1, activeTimelineIndex + step));
  if (nextIndex === activeTimelineIndex) {
    return;
  }

  activeTimelineIndex = nextIndex;
  renderTimelineCard();
}

function handleTimelineSliderInput(event) {
  if (!timelineEntries.length) {
    return;
  }

  const nextIndex = Number.parseInt(event.target.value, 10);
  if (Number.isNaN(nextIndex) || nextIndex === activeTimelineIndex) {
    return;
  }

  activeTimelineIndex = Math.max(0, Math.min(timelineEntries.length - 1, nextIndex));
  renderTimelineCard();
}

function renderTimelineCard() {
  timelineContent.innerHTML = "";

  const entry = timelineEntries[activeTimelineIndex];
  if (!entry) {
    timelineContent.innerHTML = '<p class="empty-state">Hourly forecast data was not available for this location.</p>';
    updateTimelineControls();
    return;
  }

  const node = timelineTemplate.content.firstElementChild.cloneNode(true);
  node.classList.toggle("change", entry.hasPolicyChange);
  node.querySelector(".timeline-time").textContent = new Date(entry.period.startTime).toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  node.querySelector(".timeline-forecast").textContent = entry.period.shortForecast || "Forecast unavailable";
  const badge = node.querySelector(".timeline-badge");
  badge.textContent = entry.hasPolicyChange
    ? `Policy Change: ${entry.badgeLabel}`
    : entry.badgeLabel;
  badge.classList.add(entry.badgeClass);

  const metrics = node.querySelector(".timeline-metrics");
  entry.metrics.forEach((text) => {
    const pill = document.createElement("span");
    pill.textContent = text;
    metrics.appendChild(pill);
  });

  const actions = node.querySelector(".timeline-actions");
  entry.actions.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.classList.toggle("timeline-action-shutdown", canonicalizeAction(item) === "shutdown all operations");
    actions.appendChild(li);
  });

  timelineContent.appendChild(node);
  updateTimelineControls();
}

function updateTimelineControls() {
  const hasEntries = timelineEntries.length > 0;
  timelinePrevButton.disabled = !hasEntries || activeTimelineIndex === 0;
  timelineNextButton.disabled = !hasEntries || activeTimelineIndex === timelineEntries.length - 1;
  timelineSlider.disabled = !hasEntries;
  timelineSlider.min = "0";
  timelineSlider.max = hasEntries ? String(timelineEntries.length - 1) : "0";
  timelineSlider.value = hasEntries ? String(activeTimelineIndex) : "0";
  timelinePositionValue.textContent = hasEntries
    ? new Date(timelineEntries[activeTimelineIndex].period.startTime).toLocaleString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    })
    : "--";
  timelineCountValue.textContent = hasEntries
    ? `Card ${activeTimelineIndex + 1} of ${timelineEntries.length}`
    : "--";
  timelineSliderHint.textContent = hasEntries
    ? `${formatTimelineSliderLabel(timelineEntries[0].period.startTime)} to ${formatTimelineSliderLabel(timelineEntries[timelineEntries.length - 1].period.startTime)}`
    : "Forecast timeline unavailable";
  renderTimelineSliderMarkers();
  renderTimelineSliderLabels();
}

function formatTimelineSliderLabel(startTime) {
  return new Date(startTime).toLocaleString([], {
    weekday: "short",
    hour: "numeric",
  });
}

function renderTimelineSliderMarkers() {
  timelineSliderMarkers.innerHTML = "";

  if (!timelineEntries.length) {
    return;
  }

  if (timelineEntries.length === 1) {
    const segment = document.createElement("span");
    segment.className = `timeline-slider-policy-segment ${timelineEntries[0].badgeClass}`;
    segment.style.left = "0%";
    segment.style.width = "100%";
    segment.title = `${timelineEntries[0].badgeLabel} in effect at ${formatTimelineSliderLabel(timelineEntries[0].period.startTime)}`;
    timelineSliderMarkers.appendChild(segment);
    return;
  }

  const maxIndex = timelineEntries.length - 1;
  let startIndex = 0;

  timelineEntries.forEach((entry, index) => {
    const nextEntry = timelineEntries[index + 1];
    if (nextEntry && nextEntry.badgeClass === entry.badgeClass) {
      return;
    }

    const segment = document.createElement("span");
    segment.className = `timeline-slider-policy-segment ${entry.badgeClass}`;
    const leftBoundary = startIndex === 0 ? 0 : ((startIndex - 0.5) / maxIndex) * 100;
    const rightBoundary = index === maxIndex ? 100 : ((index + 0.5) / maxIndex) * 100;
    segment.style.left = `${leftBoundary}%`;
    segment.style.width = `${rightBoundary - leftBoundary}%`;
    segment.title = `${entry.badgeLabel} in effect through ${formatTimelineSliderLabel(entry.period.startTime)}`;
    timelineSliderMarkers.appendChild(segment);
    startIndex = index + 1;
  });
}

function renderTimelineSliderLabels() {
  timelineSliderLabels.innerHTML = "";

  if (!timelineEntries.length) {
    return;
  }

  const labelIndexes = new Set(getTimelineLabelIndexes(timelineEntries.length));
  timelineEntries.forEach((entry, index) => {
    const label = document.createElement("span");
    const maxIndex = Math.max(timelineEntries.length - 1, 1);
    const position = `${(index / maxIndex) * 100}%`;

    if (labelIndexes.has(index)) {
      label.className = "timeline-slider-scale-label";
      if (index === 0) {
        label.classList.add("edge-start");
      } else if (index === maxIndex) {
        label.classList.add("edge-end");
      } else {
        label.style.left = position;
      }
      label.textContent = formatTimelineScaleLabel(entry.period.startTime);
    } else {
      label.className = "timeline-slider-scale-tick";
      label.style.left = position;
    }

    timelineSliderLabels.appendChild(label);
  });
}

function getTimelineLabelIndexes(totalEntries) {
  if (totalEntries <= 1) {
    return [0];
  }

  if (totalEntries <= 8) {
    return Array.from({ length: totalEntries }, (_, index) => index);
  }

  const targetCount = 6;
  const indexes = new Set([0, totalEntries - 1]);
  for (let step = 1; step < targetCount - 1; step += 1) {
    indexes.add(Math.round((step / (targetCount - 1)) * (totalEntries - 1)));
  }

  return [...indexes].sort((left, right) => left - right);
}

function formatTimelineScaleLabel(startTime) {
  return new Date(startTime).toLocaleString([], {
    hour: "numeric",
  });
}

function updateForecastDayAvailability(periods) {
  const hasTomorrowForecast = getSelectedForecastPeriods(periods, "tomorrow").length > 0;

  forecastDayField.classList.toggle("hidden", !hasTomorrowForecast);

  if (!hasTomorrowForecast && forecastDaySelect.value !== "today") {
    forecastDaySelect.value = "today";
    savePreferences({
      locationQuery: locationInput.value.trim(),
      forecastDay: "today",
      policy: policySelect.value,
      workload: "moderate",
      sun: sunSelect.value,
    });
  }

  return hasTomorrowForecast ? forecastDaySelect.value : "today";
}

function getSelectedForecastPeriods(periods, forecastDay) {
  const allPeriods = periods ?? [];
  if (!allPeriods.length) {
    return [];
  }

  const baseDateKey = getPeriodDateKey(allPeriods[0].startTime);
  const targetDateKey = addDaysToDateKey(baseDateKey, forecastDay === "tomorrow" ? 1 : 0);
  return allPeriods.filter((period) => getPeriodDateKey(period.startTime) === targetDateKey);
}

function getPeriodDateKey(startTime) {
  return String(startTime).slice(0, 10);
}

function addDaysToDateKey(dateKey, dayOffset) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function buildForecastSummary(periods, directSun) {
  if (!periods.length) {
    return null;
  }

  let hottestPeriod = null;
  let hottestHeatIndex = Number.NEGATIVE_INFINITY;

  periods.forEach((period) => {
    const temperatureF = period.temperatureUnit === "F"
      ? period.temperature
      : celsiusToFahrenheit(period.temperature);
    const humidity = period.relativeHumidity?.value;

    if (typeof temperatureF !== "number" || typeof humidity !== "number") {
      return;
    }

    const heatIndex = calculateHeatIndex(temperatureF, humidity);
    const adjustedHeatIndex = directSun ? heatIndex + 15 : heatIndex;

    if (adjustedHeatIndex > hottestHeatIndex) {
      hottestHeatIndex = adjustedHeatIndex;
      hottestPeriod = {
        period,
        temperatureF,
        humidity,
        adjustedHeatIndex,
      };
    }
  });

  return hottestPeriod;
}

function formatForecastDayLabel(forecastDay) {
  return forecastDay === "tomorrow" ? "Tomorrow" : "Today";
}

function buildRequiredActions(policy, riskKey, adjustedHeatIndex) {
  if (policy === "taxiway") {
    const items = [
      "Each employee is required to drink at least 2 bottles of water per hour.",
      "Each employee should take roughly a 5-minute cooldown break every 30 minutes.",
    ];

    if (riskKey === "ninetyFive" || riskKey === "oneOhFive" || riskKey === "oneTen") {
      items.push("At 95 heat index and above, breaks every 30 minutes, mandatory shade, and electrolytes are required.");
    }

    if (riskKey === "oneOhFive" || riskKey === "oneTen") {
      items.push("At 105 heat index and above, crews may work no more than 2 consecutive hours in this range.");
    }

    if (riskKey === "oneTen" || adjustedHeatIndex >= 110) {
      items.push("At 110 heat index, shut down all operations.");
    }

    return items;
  }

  const items = ["Implement hourly mandatory hydration breaks."];

  if (riskKey === "minimal") {
    items.push("No special workday limit is specified at this classification; continue normal scheduling with heat-illness awareness.");
  }

  if (riskKey === "low") {
    items.push("No special workday limit is specified at this classification; continue hourly hydration breaks and keep monitoring conditions.");
  }

  if (riskKey === "moderate") {
    items.push("No special workday limit is specified at this classification, but shifts should start as early as possible.");
  }

  if (riskKey === "high") {
    items.push("Limit workdays to 10 hours maximum.");
    items.push("Any work over 10 hours must be approved by the Safety District Manager.");
  }

  if (riskKey === "extreme") {
    items.push("Limit workdays to 8 hours maximum.");
    items.push("Any work over 8 hours must be approved by the Safety District Manager.");
  }

  return items;
}

function buildRequiredSetup(policy, riskKey) {
  if (policy === "taxiway") {
    const items = [
      "Provide a hydration station in the work area with shade, ice water, and Working Athlete or Liquid IV.",
      "Superintendent and foreman must verify crews are fit to work and allow cooldown breaks when needed.",
    ];

    if (riskKey === "ninetyFive" || riskKey === "oneOhFive" || riskKey === "oneTen") {
      items.push("At 95 heat index and above, misting fans, shade, and hydration packs are required.");
      items.push("At 95 heat index and above, fruit or ice pops and a swamp cooler or misting fan should be available.");
    }

    return items;
  }

  const items = [
    "Place hydration stations at each operation during high temperatures.",
    "Provide cool water, coolers, shade structures, and Working Athlete or similar hydration product at temperatures greater than 90°F.",
  ];

  if (riskKey === "moderate" || riskKey === "high" || riskKey === "extreme") {
    items.push("Provide shade or break rooms and keep them accessible to craftsmen throughout the shift.");
  }

  return items;
}

function buildPolicyActions(policy, riskKey) {
  if (policy === "taxiway") {
    if (riskKey === "oneTen") {
      return [...taxiwayGuidanceBlocks.oneTen.items];
    }

    if (riskKey === "oneOhFive") {
      return [...taxiwayGuidanceBlocks.oneOhFive.items];
    }

    if (riskKey === "ninetyFive") {
      return [...taxiwayGuidanceBlocks.ninetyFive.items];
    }

    return [
      "Start shifts as early as possible and no later than 6:00 AM when possible.",
      "Project management may reevaluate crews individually and shut down operations early when conditions warrant.",
    ];
  }

  return buildDistrictPolicyDetails(riskKey);
}

function buildDistrictPolicyDetails(riskKey) {
  if (riskKey === "minimal") {
    return [
      "Employees shall be trained in the signs and symptoms of heat illness.",
      "Continue normal hydration support and supervisor monitoring.",
      "Use the OSHA or NIOSH heat app to keep checking conditions as the day changes.",
    ];
  }

  if (riskKey === "low") {
    return [
      "Keep hydration stations available in the work area.",
      "Continue monitoring in case changing forecast conditions require reclassification.",
    ];
  }

  if (riskKey === "moderate") {
    return [
      "Start shifts as early as possible when practical.",
      "Increase monitoring where conditions include radiant heat, humidity, or limited air movement.",
    ];
  }

  if (riskKey === "high") {
    return [
      "Start shifts as early as possible to limit afternoon exposure.",
      "Keep shade or breakrooms accessible to craftsmen.",
    ];
  }

  return [
    "Start shifts as early as possible to limit afternoon exposure.",
    "Keep shade or breakrooms accessible to craftsmen.",
  ];
}

function buildHourlyActions(policy, riskKey, adjustedHeatIndex, hasPolicyChange) {
  const actions = [
    ...buildRequiredActions(policy, riskKey, adjustedHeatIndex),
    ...buildRequiredSetup(policy, riskKey),
    ...buildPolicyActions(policy, riskKey),
    ...buildNewWorkerGuidance(policy),
    ...buildResponsibilityGuidance(policy),
  ];

  if (hasPolicyChange) {
    actions.unshift("A new policy level begins this hour. Confirm the updated controls are in place before work continues.");
  }

  const uniqueActions = [];
  actions.forEach((item) => {
    if (!uniqueActions.some((existing) => canonicalizeAction(existing) === canonicalizeAction(item))) {
      uniqueActions.push(item);
    }
  });

  if (containsShutdownAction(uniqueActions)) {
    return ["Shutdown all operations"];
  }

  return uniqueActions.slice(0, 8);
}

function canonicalizeAction(text) {
  return text
    .toLowerCase()
    .replace(/breakrooms/g, "break rooms")
    .replace(/craftsmen/g, "workers")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsShutdownAction(actions) {
  return actions.some((item) => canonicalizeAction(item).includes("shut down all operations"));
}

function getBadgeClass(policy, riskKey) {
  if (policy === "taxiway") {
    if (riskKey === "standard") {
      return "low";
    }
    if (riskKey === "ninetyFive") {
      return "medium";
    }
    if (riskKey === "oneOhFive") {
      return "high";
    }
    return "extreme";
  }

  if (riskKey === "minimal" || riskKey === "low") {
    return "low";
  }
  if (riskKey === "moderate") {
    return "medium";
  }
  if (riskKey === "high") {
    return "high";
  }
  return "extreme";
}

function buildBadgeLabel(policy, riskKey) {
  if (policy === "taxiway") {
    if (riskKey === "standard") {
      return "Below 95";
    }
    if (riskKey === "ninetyFive") {
      return "95-104";
    }
    if (riskKey === "oneOhFive") {
      return "105-109";
    }
    return "110+";
  }

  if (riskKey === "minimal" || riskKey === "low") {
    return "Low Risk";
  }
  if (riskKey === "moderate") {
    return "Medium Risk";
  }
  return "High Risk";
}

function buildResponsibilityGuidance(policy) {
  return [
    ...universalRoleGuidance.all,
    ...(policy === "taxiway" ? universalRoleGuidance.taxiway : universalRoleGuidance.district),
  ];
}

function buildNewWorkerGuidance(policy) {
  if (policy === "taxiway") {
    return [
      "Per the Taxiway U SOP and NIOSH guidance, new hires that have not worked in the heat may need reduced hours and limited shifts during the first week.",
      "Project leaders should reevaluate individual workers based on current operations and priority work.",
      "Front-line supervisors must actively check in on new workers and verify the acclimatization process is being followed.",
    ];
  }

  return [
    "New hires that have not been working in present conditions should be acclimated over a two-week period by limiting work hours to 6 to 8 hours excluding overtime.",
    "Each new hire should complete the Heat Checklist in orientation to establish a monitoring baseline.",
    "Front-line supervisors must actively check in on new workers and verify the acclimatization process is being followed.",
  ];
}

function setMetricValues(temp, humidity, heatIndex, risk) {
  temperatureValue.textContent = temp;
  humidityValue.textContent = humidity;
  heatIndexValue.textContent = heatIndex;
  riskLevelValue.textContent = risk;
}

function renderSymptoms() {
  symptomGrid.innerHTML = "";
  symptomLibrary.forEach((item) => {
    const node = symptomTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".symptom-signs").textContent = item.signs;
    node.querySelector(".symptom-actions").textContent = item.actions;
    symptomGrid.appendChild(node);
  });
}

function classifyOshaRisk(heatIndex) {
  if (heatIndex < 80) {
    return {
      key: "lower",
      label: "Lower",
      summary: "Normal precautions still apply; continue hydration and symptom awareness.",
      bannerClass: "risk-low",
    };
  }

  if (heatIndex < 91) {
    return {
      key: "moderate",
      label: "Moderate",
      summary: "Increase hydration reminders and monitor for early heat illness symptoms.",
      bannerClass: "risk-moderate",
    };
  }

  if (heatIndex < 103) {
    return {
      key: "high",
      label: "High",
      summary: "Add stronger controls, earlier start times where possible, and closer supervision.",
      bannerClass: "risk-moderate",
    };
  }

  if (heatIndex < 115) {
    return {
      key: "veryHigh",
      label: "Very High",
      summary: "Mandatory cooldown, tighter exposure limits, and supervisor approval rules apply.",
      bannerClass: "risk-high",
    };
  }

  return {
    key: "extreme",
    label: "Extreme",
    summary: "Maximum restrictions apply, including short exposure windows and written approvals.",
    bannerClass: "risk-extreme",
  };
}

function classifyPolicyRisk(heatIndex, policy) {
  if (policy === "taxiway") {
    if (heatIndex >= 110) {
      return {
        key: "oneTen",
        label: "110+",
        summary: "Taxiway SOP requires shutdown of all operations at 110 heat index.",
        bannerClass: "risk-extreme",
      };
    }

    if (heatIndex >= 105) {
      return {
        key: "oneOhFive",
        label: "105 to 109",
        summary: "Taxiway SOP limits crews to 2 consecutive hours in this range and requires early shift end.",
        bannerClass: "risk-high",
      };
    }

    if (heatIndex >= 95) {
      return {
        key: "ninetyFive",
        label: "95 to 104",
        summary: "Taxiway SOP requires 30-minute break cycles, misting fans, mandatory shade, and hydration packs.",
        bannerClass: "risk-high",
      };
    }

    return {
      key: "standard",
      label: "Below 95",
      summary: "Taxiway baseline controls still apply, including hydration station, 30-minute cooldown rhythm, and early start.",
      bannerClass: "risk-low",
    };
  }

  if (heatIndex < 80) {
    return {
      key: "minimal",
      label: "Minimal Risk",
      summary: "SOP_052 requires training awareness and continued monitoring.",
      bannerClass: "risk-low",
    };
  }

  if (heatIndex < 91) {
    return {
      key: "low",
      label: "Low Risk",
      summary: "SOP_052 requires hourly mandatory hydration breaks.",
      bannerClass: "risk-moderate",
    };
  }

  if (heatIndex < 103) {
    return {
      key: "moderate",
      label: "Moderate Risk",
      summary: "SOP_052 calls for hourly hydration breaks plus shade or break rooms and earlier starts.",
      bannerClass: "risk-moderate",
    };
  }

  if (heatIndex < 125) {
    return {
      key: "high",
      label: "High Risk",
      summary: "SOP_052 limits workdays to 10 hours and requires Safety District Manager approval beyond that.",
      bannerClass: "risk-high",
    };
  }

  return {
    key: "extreme",
    label: "Extreme Risk",
    summary: "SOP_052 limits workdays to 8 hours and requires Safety District Manager approval beyond that.",
    bannerClass: "risk-extreme",
  };
}

function calculateHeatIndex(temperatureF, humidity) {
  if (temperatureF < 80 || humidity < 40) {
    return temperatureF;
  }

  const t = temperatureF;
  const rh = humidity;
  let index =
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    0.00683783 * t * t -
    0.05481717 * rh * rh +
    0.00122874 * t * t * rh +
    0.00085282 * t * rh * rh -
    0.00000199 * t * t * rh * rh;

  if (rh < 13 && t >= 80 && t <= 112) {
    index -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  } else if (rh > 85 && t >= 80 && t <= 87) {
    index += ((rh - 85) / 10) * ((87 - t) / 5);
  }

  return index;
}

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}
