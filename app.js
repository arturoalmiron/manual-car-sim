// Car state
let engineOn = false
let gear = "Neutral"
let clutchPressed = false
let handbrakeOn = true
let accelerating = false
let braking = false
let speed = 0
let rpm = 0
let stalled = false

// Settings
let shakeEnabled = true
let soundEnabled = true
let useImperial = true // true for MPH, false for KPH

// Gear positions
const gearPositions = {
  1: { x: 30, y: 30 },
  2: { x: 30, y: 90 },
  3: { x: 60, y: 30 },
  4: { x: 60, y: 90 },
  5: { x: 90, y: 30 },
  Reverse: { x: 90, y: 90 },
  Neutral: { x: 60, y: 60 },
}

// Adjust gear positions for mobile
function updateGearPositions() {
  const gearContainer = document.querySelector(".gear-container")
  if (!gearContainer) return

  const isMobile = window.innerWidth <= 428
  const containerWidth = gearContainer.offsetWidth
  const containerHeight = gearContainer.offsetHeight

  if (isMobile) {
    gearPositions["1"].x = containerWidth * 0.25
    gearPositions["1"].y = containerHeight * 0.25
    gearPositions["2"].x = containerWidth * 0.25
    gearPositions["2"].y = containerHeight * 0.75
    gearPositions["3"].x = containerWidth * 0.5
    gearPositions["3"].y = containerHeight * 0.25
    gearPositions["4"].x = containerWidth * 0.5
    gearPositions["4"].y = containerHeight * 0.75
    gearPositions["5"].x = containerWidth * 0.75
    gearPositions["5"].y = containerHeight * 0.25
    gearPositions["Reverse"].x = containerWidth * 0.75
    gearPositions["Reverse"].y = containerHeight * 0.75
    gearPositions["Neutral"].x = containerWidth * 0.5
    gearPositions["Neutral"].y = containerHeight * 0.5
  } else {
    gearPositions["1"].x = 30
    gearPositions["1"].y = 30
    gearPositions["2"].x = 30
    gearPositions["2"].y = 90
    gearPositions["3"].x = 60
    gearPositions["3"].y = 30
    gearPositions["4"].x = 60
    gearPositions["4"].y = 90
    gearPositions["5"].x = 90
    gearPositions["5"].y = 30
    gearPositions["Reverse"].x = 90
    gearPositions["Reverse"].y = 90
    gearPositions["Neutral"].x = 60
    gearPositions["Neutral"].y = 60
  }

  // Update gear stick position if it's already in a gear
  if (gear) {
    const pos = gearPositions[gear]
    const gearStickEl = document.getElementById("gear-stick")
    if (gearStickEl) {
      gearStickEl.style.left = `${pos.x}px`
      gearStickEl.style.top = `${pos.y}px`
    }
  }
}

// Car specifications
const maxSpeeds = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 120,
  Reverse: 15,
  Neutral: 0,
}

const optimalShiftRpm = 2500
const maxRpm = 4000
const idleRpm = 800
const stallRpm = 500

// DOM elements
const bodyEl = document.getElementById("car-body")
const engineStatusEl = document.getElementById("engine-status")
const gearStatusEl = document.getElementById("gear-status")
const clutchStatusEl = document.getElementById("clutch-status")
const handbrakeStatusEl = document.getElementById("handbrake-status")
const speedValueEl = document.getElementById("speed-value")
const speedUnitEl = document.getElementById("speed-unit")
const rpmValueEl = document.getElementById("rpm-value")
const messageEl = document.getElementById("message")
const gearStickEl = document.getElementById("gear-stick")
const clutchEl = document.getElementById("clutch")
const accelerateEl = document.getElementById("accelerate")
const brakeEl = document.getElementById("brake")
const handbrakeEl = document.getElementById("handbrake")
const roadLineEl = document.getElementById("road-line")
const shakeToggleEl = document.getElementById("shake-toggle")
const soundToggleEl = document.getElementById("sound-toggle")
const unitToggleEl = document.getElementById("unit-toggle")
const unitLabelEl = document.getElementById("unit-label")
const speedNeedleEl = document.getElementById("speed-needle")
const rpmNeedleEl = document.getElementById("rpm-needle")

// Indicators
const engineIndicatorEl = document.getElementById("engine-indicator")
const gearIndicatorEl = document.getElementById("gear-indicator")
const clutchIndicatorEl = document.getElementById("clutch-indicator")
const handbrakeIndicatorEl = document.getElementById("handbrake-indicator")

// Mobile controls
const mobileClutchEl = document.getElementById("mobile-clutch")
const mobileBrakeEl = document.getElementById("mobile-brake")
const mobileGasEl = document.getElementById("mobile-gas")

// Sound effects
const engineStartSound = new Audio()
engineStartSound.src =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

const engineStopSound = new Audio()
engineStopSound.src =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

const engineIdleSound = new Audio()
engineIdleSound.src =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="
engineIdleSound.loop = true

const engineRevSound = new Audio()
engineRevSound.src =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

const gearShiftSound = new Audio()
gearShiftSound.src =
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

// Initialize gauge markings
function initializeGauges() {
  // Create speedometer markings
  const speedMarkings = document.getElementById("speed-markings")
  for (let i = 0; i <= 12; i++) {
    // Create marking line
    const marking = document.createElement("div")
    marking.className = i % 2 === 0 ? "gauge-marking major" : "gauge-marking"
    marking.style.transform = `rotate(${i * 20 - 120}deg)`
    speedMarkings.appendChild(marking)

    // Create value label for major markings
    if (i % 2 === 0) {
      const value = document.createElement("div")
      value.className = "gauge-value"
      value.textContent = i * 10
      // Position the value
      const angle = ((i * 20 - 120) * Math.PI) / 180
      const radius = 75
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      value.style.left = `calc(50% + ${x}px)`
      value.style.top = `calc(50% + ${y}px)`
      value.style.transform = `translate(-50%, -50%)`
      speedMarkings.appendChild(value)
    }
  }

  // Create tachometer markings
  const rpmMarkings = document.getElementById("rpm-markings")
  for (let i = 0; i <= 8; i++) {
    // Create marking line
    const marking = document.createElement("div")
    marking.className = i % 2 === 0 ? "gauge-marking major" : "gauge-marking"
    marking.style.transform = `rotate(${i * 30 - 120}deg)`
    rpmMarkings.appendChild(marking)

    // Create value label for major markings
    if (i % 2 === 0) {
      const value = document.createElement("div")
      value.className = "gauge-value"
      value.textContent = i
      // Position the value
      const angle = ((i * 30 - 120) * Math.PI) / 180
      const radius = 75
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      value.style.left = `calc(50% + ${x}px)`
      value.style.top = `calc(50% + ${y}px)`
      value.style.transform = `translate(-50%, -50%)`
      rpmMarkings.appendChild(value)
    }
  }
}

// Initialize gauge markings
initializeGauges()

// Initialize gear stick position
moveGearStick("Neutral")

// Update display function
function updateDisplay() {
  // Update engine status
  engineStatusEl.textContent = engineOn ? (stalled ? "STALLED" : "ON") : "OFF"
  engineIndicatorEl.className = engineOn ? (stalled ? "indicator warning" : "indicator active") : "indicator"

  // Update gear status
  let gearDisplay = gear
  if (gear === "Neutral") gearDisplay = "N"
  else if (gear === "Reverse") gearDisplay = "R"
  gearStatusEl.textContent = gearDisplay
  gearIndicatorEl.className = "indicator"

  // Update clutch status
  clutchStatusEl.textContent = clutchPressed ? "IN" : "OUT"
  clutchIndicatorEl.className = clutchPressed ? "indicator active" : "indicator"

  // Update handbrake status
  handbrakeStatusEl.textContent = handbrakeOn ? "ON" : "OFF"
  handbrakeIndicatorEl.className = handbrakeOn ? "indicator warning" : "indicator"

  // Update speed display
  const displaySpeed = useImperial ? speed : speed * 1.609
  speedValueEl.textContent = displaySpeed.toFixed(0)
  speedUnitEl.textContent = useImperial ? "MPH" : "KPH"

  // Update RPM display
  rpmValueEl.textContent = (rpm / 1000).toFixed(1)

  // Update gauge needles
  // Speed needle (240 degree range from -120 to 120)
  const maxSpeedOnGauge = 120
  const speedAngle = (displaySpeed / maxSpeedOnGauge) * 240 - 120
  speedNeedleEl.style.transform = `rotate(${Math.min(speedAngle, 120)}deg)`

  // RPM needle (240 degree range from -120 to 120)
  const rpmAngle = (rpm / maxRpm) * 240 - 120
  rpmNeedleEl.style.transform = `rotate(${Math.min(rpmAngle, 120)}deg)`

  // Update pedal states
  clutchEl.classList.toggle("pressed", clutchPressed)
  accelerateEl.classList.toggle("pressed", accelerating)
  brakeEl.classList.toggle("pressed", braking)

  // Update handbrake visual
  handbrakeEl.classList.toggle("engaged", handbrakeOn)

  // Update road animation
  if (speed > 0) {
    roadLineEl.style.animationPlayState = "running"
    roadLineEl.style.animationDuration = `${2 - speed / 60}s`
  } else {
    roadLineEl.style.animationPlayState = "paused"
  }

  // Screen shake effect
  if (shakeEnabled && engineOn && !stalled) {
    const shakeAmount = (accelerating ? 2 : 1) * (rpm / maxRpm) * (speed > 0 ? 1 : 0.3)
    if (shakeAmount > 0.1) {
      const randomX = (Math.random() - 0.5) * shakeAmount
      const randomY = (Math.random() - 0.5) * shakeAmount
      bodyEl.style.transform = `translate(${randomX}px, ${randomY}px)`
    } else {
      bodyEl.style.transform = "translate(0, 0)"
    }
  } else {
    bodyEl.style.transform = "translate(0, 0)"
  }

  // Sound effects
  if (soundEnabled && engineOn && !stalled) {
    if (!engineIdleSound.paused || rpm > idleRpm) {
      // Adjust volume based on RPM
      const volume = 0.3 + (rpm / maxRpm) * 0.7
      engineIdleSound.volume = volume

      // Adjust playback rate based on RPM
      const rate = 0.8 + (rpm / maxRpm) * 1.2
      engineIdleSound.playbackRate = rate

      if (engineIdleSound.paused) {
        engineIdleSound.play().catch((e) => console.log("Audio play failed:", e))
      }
    }
  } else {
    engineIdleSound.pause()
  }
}

// Show message function
function showMessage(msg, duration = 2000) {
  messageEl.textContent = msg
  if (duration > 0) {
    setTimeout(() => {
      messageEl.textContent = ""
    }, duration)
  }
}

// Play sound function
function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0
    sound.play().catch((e) => console.log("Audio play failed:", e))
  }
}

// Move gear stick function
function moveGearStick(newGear) {
  if (newGear in gearPositions) {
    const oldGear = gear
    gear = newGear
    const pos = gearPositions[newGear]
    gearStickEl.style.left = `${pos.x}px`
    gearStickEl.style.top = `${pos.y}px`

    // Play gear shift sound if actually changing gears
    if (oldGear !== newGear) {
      playSound(gearShiftSound)
    }

    updateDisplay()
  }
}

// Start/stop engine
document.getElementById("start-engine").addEventListener("click", () => {
  if (!engineOn) {
    if (clutchPressed) {
      engineOn = true
      stalled = false
      rpm = idleRpm
      playSound(engineStartSound)
      showMessage("Engine started")
    } else {
      showMessage("Press the clutch to start the engine")
    }
  } else {
    engineOn = false
    rpm = 0
    playSound(engineStopSound)
    showMessage("Engine stopped")
  }
  updateDisplay()
})

// Clutch control
clutchEl.addEventListener("mousedown", () => {
  clutchPressed = true
  updateDisplay()
})

clutchEl.addEventListener("mouseup", () => {
  clutchPressed = false

  // Check for stall conditions when releasing clutch
  if (engineOn && !stalled && gear !== "Neutral" && rpm < stallRpm && !accelerating) {
    stalled = true
    showMessage("Engine stalled! Press clutch and restart", 0)
  }

  updateDisplay()
})

// Add multi-touch support by tracking active touches
const activeTouches = {}

// Modify the touch event handlers for pedals to support multi-touch
// Replace the existing touch event handlers for clutch
clutchEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "clutch"
  }
  clutchPressed = true
  updateDisplay()
})

clutchEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "clutch") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release clutch if no touches are still on the clutch
  if (!Object.values(activeTouches).includes("clutch")) {
    clutchPressed = false

    // Check for stall conditions when releasing clutch
    if (engineOn && !stalled && gear !== "Neutral" && rpm < stallRpm && !accelerating) {
      stalled = true
      showMessage("Engine stalled! Press clutch and restart", 0)
    }
  }

  updateDisplay()
})

// Replace the existing touch event handlers for accelerator
accelerateEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "accelerate"
  }
  accelerating = true
  updateDisplay()
})

accelerateEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "accelerate") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release accelerator if no touches are still on it
  if (!Object.values(activeTouches).includes("accelerate")) {
    accelerating = false
  }

  updateDisplay()
})

// Replace the existing touch event handlers for brake
brakeEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "brake"
  }
  braking = true
  updateDisplay()
})

brakeEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "brake") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release brake if no touches are still on it
  if (!Object.values(activeTouches).includes("brake")) {
    braking = false
  }

  updateDisplay()
})

// Update mobile button handlers for multi-touch
mobileClutchEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "mobile-clutch"
  }
  clutchPressed = true
  updateDisplay()
})

mobileClutchEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "mobile-clutch") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release clutch if no touches are still on the mobile clutch button
  if (!Object.values(activeTouches).includes("mobile-clutch") && !Object.values(activeTouches).includes("clutch")) {
    clutchPressed = false

    // Check for stall conditions when releasing clutch
    if (engineOn && !stalled && gear !== "Neutral" && rpm < stallRpm && !accelerating) {
      stalled = true
      showMessage("Engine stalled! Press clutch and restart", 0)
    }
  }

  updateDisplay()
})

mobileGasEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "mobile-gas"
  }
  accelerating = true
  updateDisplay()
})

mobileGasEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "mobile-gas") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release accelerator if no touches are still on the mobile gas button
  if (!Object.values(activeTouches).includes("mobile-gas") && !Object.values(activeTouches).includes("accelerate")) {
    accelerating = false
  }

  updateDisplay()
})

mobileBrakeEl.addEventListener("touchstart", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    activeTouches[touch.identifier] = "mobile-brake"
  }
  braking = true
  updateDisplay()
})

mobileBrakeEl.addEventListener("touchend", (e) => {
  e.preventDefault()
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "mobile-brake") {
      delete activeTouches[touch.identifier]
    }
  }

  // Only release brake if no touches are still on the mobile brake button
  if (!Object.values(activeTouches).includes("mobile-brake") && !Object.values(activeTouches).includes("brake")) {
    braking = false
  }

  updateDisplay()
})

// Handbrake control
handbrakeEl.addEventListener("click", () => {
  handbrakeOn = !handbrakeOn

  if (handbrakeOn && speed > 5) {
    showMessage("Warning: Engaging handbrake at speed!")
    speed = Math.max(0, speed - 10) // Rapid deceleration
  }

  updateDisplay()
})

// Accelerator control
accelerateEl.addEventListener("mousedown", () => {
  accelerating = true
  updateDisplay()
})

accelerateEl.addEventListener("mouseup", () => {
  accelerating = false
  updateDisplay()
})

// Touch events for accelerator
//accelerateEl.addEventListener("touchstart", (e) => {
//  e.preventDefault()
//  accelerating = true
//  updateDisplay()
//})
//
//accelerateEl.addEventListener("touchend", (e) => {
//  e.preventDefault()
//  accelerating = false
//  updateDisplay()
//})

// Mobile gas button
//mobileGasEl.addEventListener("touchstart", (e) => {
//  e.preventDefault()
//  accelerating = true
//  updateDisplay()
//})
//
//mobileGasEl.addEventListener("touchend", (e) => {
//  e.preventDefault()
//  accelerating = false
//  updateDisplay()
//})

// Brake control
brakeEl.addEventListener("mousedown", () => {
  braking = true
  updateDisplay()
})

brakeEl.addEventListener("mouseup", () => {
  braking = false
  updateDisplay()
})

// Touch events for brake
//brakeEl.addEventListener("touchstart", (e) => {
//  e.preventDefault()
//  braking = true
//  updateDisplay()
//})
//
//brakeEl.addEventListener("touchend", (e) => {
//  e.preventDefault()
//  braking = false
//  updateDisplay()
//})

// Mobile brake button
//mobileBrakeEl.addEventListener("touchstart", (e) => {
//  e.preventDefault()
//  braking = true
//  updateDisplay()
//})
//
//mobileBrakeEl.addEventListener("touchend", (e) => {
//  e.preventDefault()
//  braking = false
//  updateDisplay()
//})

// Gear stick drag functionality
let isDragging = false

gearStickEl.addEventListener("mousedown", (e) => {
  if (clutchPressed || gear === "Neutral") {
    isDragging = true
    e.preventDefault() // Prevent text selection
  } else {
    showMessage("Press the clutch to change gears")
  }
})

document.addEventListener("mouseup", () => {
  isDragging = false
})

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const container = gearStickEl.parentElement
    const rect = container.getBoundingClientRect()

    let x = event.clientX - rect.left
    let y = event.clientY - rect.top

    // Constrain to container
    x = Math.max(20, Math.min(x, rect.width - 20))
    y = Math.max(20, Math.min(y, rect.height - 20))

    // Determine gear based on position
    let newGear

    // Neutral zone (center)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const neutralRadius = 20

    if (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) < neutralRadius) {
      newGear = "Neutral"
    } else if (x < centerX - 10) {
      newGear = y < centerY ? "1" : "2"
    } else if (x > centerX + 10) {
      newGear = y < centerY ? "5" : "Reverse"
    } else {
      newGear = y < centerY ? "3" : "4"
    }

    // Check if we can change to this gear
    if (newGear !== gear) {
      if (clutchPressed || (gear === "Neutral" && newGear === "Neutral")) {
        // Snap to the exact position for the gear
        const pos = gearPositions[newGear]
        gearStickEl.style.left = `${pos.x}px`
        gearStickEl.style.top = `${pos.y}px`

        // If shifting from a driving gear to reverse or vice versa
        if (
          (gear !== "Neutral" && gear !== "Reverse" && newGear === "Reverse") ||
          (gear === "Reverse" && newGear !== "Neutral")
        ) {
          if (speed > 2) {
            showMessage("Cannot shift to/from reverse while moving!")
            moveGearStick("Neutral")
            return
          }
        }

        gear = newGear

        // Check for grinding gears (shifting without clutch at speed)
        if (!clutchPressed && speed > 5 && gear !== "Neutral") {
          showMessage("Grinding gears! Use the clutch when shifting")
          playSound(gearShiftSound)
        }

        updateDisplay()
      } else {
        showMessage("Press the clutch to change gears")
        // Return to previous position
        moveGearStick(gear)
      }
    }
  }
})

// Touch events for gear stick
gearStickEl.addEventListener("touchstart", (e) => {
  if (clutchPressed || gear === "Neutral") {
    isDragging = true
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      activeTouches[touch.identifier] = "gear-stick"
    }
    e.preventDefault() // Prevent scrolling
  } else {
    showMessage("Press the clutch to change gears")
  }
})

document.addEventListener("touchend", (e) => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i]
    if (activeTouches[touch.identifier] === "gear-stick") {
      delete activeTouches[touch.identifier]
      isDragging = false
    }
  }
})

// Update the touchmove handler to work with multi-touch
document.addEventListener("touchmove", (event) => {
  for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[i]

    // Only process if this touch is for the gear stick
    if (activeTouches[touch.identifier] === "gear-stick" && isDragging) {
      const container = gearStickEl.parentElement
      const rect = container.getBoundingClientRect()

      let x = touch.clientX - rect.left
      let y = touch.clientY - rect.top

      // Constrain to container
      x = Math.max(20, Math.min(x, rect.width - 20))
      y = Math.max(20, Math.min(y, rect.height - 20))

      // Determine gear based on position
      let newGear

      // Neutral zone (center)
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const neutralRadius = 20

      if (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) < neutralRadius) {
        newGear = "Neutral"
      } else if (x < centerX - 10) {
        newGear = y < centerY ? "1" : "2"
      } else if (x > centerX + 10) {
        newGear = y < centerY ? "5" : "Reverse"
      } else {
        newGear = y < centerY ? "3" : "4"
      }

      // Check if we can change to this gear
      if (newGear !== gear) {
        if (clutchPressed || (gear === "Neutral" && newGear === "Neutral")) {
          // Snap to the exact position for the gear
          const pos = gearPositions[newGear]
          gearStickEl.style.left = `${pos.x}px`
          gearStickEl.style.top = `${pos.y}px`

          // If shifting from a driving gear to reverse or vice versa
          if (
            (gear !== "Neutral" && gear !== "Reverse" && newGear === "Reverse") ||
            (gear === "Reverse" && newGear !== "Neutral")
          ) {
            if (speed > 2) {
              showMessage("Cannot shift to/from reverse while moving!")
              moveGearStick("Neutral")
              return
            }
          }

          gear = newGear

          // Check for grinding gears (shifting without clutch at speed)
          if (!clutchPressed && speed > 5 && gear !== "Neutral") {
            showMessage("Grinding gears! Use the clutch when shifting")
            playSound(gearShiftSound)
          }

          updateDisplay()
        } else {
          showMessage("Press the clutch to change gears")
          // Return to previous position
          moveGearStick(gear)
        }
      }
    }
  }
})

// Toggle controls
shakeToggleEl.addEventListener("change", function () {
  shakeEnabled = this.checked
  if (!shakeEnabled) {
    bodyEl.style.transform = "translate(0, 0)"
  }
})

soundToggleEl.addEventListener("change", function () {
  soundEnabled = this.checked
  if (!soundEnabled) {
    engineIdleSound.pause()
  } else if (engineOn && !stalled) {
    engineIdleSound.play().catch((e) => console.log("Audio play failed:", e))
  }
})

// Unit toggle
unitToggleEl.addEventListener("change", function () {
  useImperial = this.checked
  unitLabelEl.textContent = useImperial ? "MPH" : "KPH"
  updateDisplay()
})

// Keyboard controls
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "z":
      clutchPressed = true
      break
    case "x":
      braking = true
      break
    case "v":
      handbrakeOn = !handbrakeOn
      if (handbrakeOn && speed > 5) {
        showMessage("Warning: Engaging handbrake at speed!")
        speed = Math.max(0, speed - 10)
      }
      break
    case "c":
      accelerating = true
      break
    case "s":
      // Start/stop engine
      if (!engineOn) {
        if (clutchPressed) {
          engineOn = true
          stalled = false
          rpm = idleRpm
          playSound(engineStartSound)
          showMessage("Engine started")
        } else {
          showMessage("Press the clutch to start the engine")
        }
      } else {
        engineOn = false
        rpm = 0
        playSound(engineStopSound)
        showMessage("Engine stopped")
      }
      break
  }
  updateDisplay()
})

document.addEventListener("keyup", (e) => {
  switch (e.key.toLowerCase()) {
    case "z":
      clutchPressed = false
      // Check for stall conditions
      if (engineOn && !stalled && gear !== "Neutral" && rpm < stallRpm && !accelerating) {
        stalled = true
        showMessage("Engine stalled! Press clutch and restart", 0)
      }
      break
    case "c":
      accelerating = false
      break
    case "x":
      braking = false
      break
  }
  updateDisplay()
})

// Game loop
setInterval(() => {
  if (engineOn && !stalled) {
    // RPM calculation
    if (clutchPressed) {
      // When clutch is pressed, RPM is controlled by accelerator
      if (accelerating) {
        rpm = Math.min(rpm + 100, maxRpm)
      } else {
        rpm = Math.max(rpm - 50, idleRpm)
      }
    } else {
      // When clutch is not pressed, RPM is affected by gear and speed
      if (gear === "Neutral") {
        if (accelerating) {
          rpm = Math.min(rpm + 100, maxRpm)
        } else {
          rpm = Math.max(rpm - 50, idleRpm)
        }
      } else {
        // RPM is linked to speed in gear
        const gearRatio = maxSpeeds[gear] / maxRpm
        const targetRpm = speed / gearRatio

        if (accelerating) {
          rpm = Math.min(rpm + 50, maxRpm)
        } else {
          rpm = targetRpm
        }

        // Engine braking when not accelerating
        if (!accelerating && !clutchPressed && speed > 0) {
          speed = Math.max(0, speed - 0.2)
        }
      }
    }

    // Speed calculation
    if (gear !== "Neutral" && !handbrakeOn) {
      if (accelerating && !clutchPressed) {
        // Calculate acceleration based on RPM and gear
        const acceleration = 0.1 * (rpm / 1000)

        if (speed < maxSpeeds[gear]) {
          speed = Math.min(speed + acceleration, maxSpeeds[gear])
        }
      }
    }
  } else {
    // Engine off or stalled
    rpm = 0
  }

  // Braking
  if (braking && speed > 0) {
    speed = Math.max(0, speed - 0.5)
  }

  // Natural deceleration
  if (speed > 0) {
    speed = Math.max(0, speed - 0.05)
  }

  // Handbrake effect
  if (handbrakeOn && speed > 0) {
    speed = Math.max(0, speed - 0.3)
  }

  updateDisplay()
}, 50)

// Handle window resize for mobile responsiveness
window.addEventListener("resize", () => {
  updateGearPositions()
})

// Initialize gear positions based on screen size
updateGearPositions()

// Initial display update
updateDisplay()

