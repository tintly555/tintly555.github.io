import { gauntletObstacleIds } from "./gauntlet-obstacles.js?v=22-double-gap-layout";

export const GAUNTLET_CHAPTER_SIZE = 20;
export const GAUNTLET_CHAPTERS = Object.freeze([
  "Perimeter", "Foundry", "Switchyard", "Spillway", "Relay", "Causeway",
  "Silo", "Outworks", "Interchange", "Blackline",
]);

// Each row is [journey, tier, obstacles, roomAfter, connector profile].
// The profile bounds the length, bend, and grade of each deterministic four-arc connector.
const CURATED_CHAPTERS = [
  {
    chapter: "Foundry",
    courses: [
      ["Furnace intake", 1, ["slopeRise", "pistonSteps", "stepStones"], 0, [[5.8, 20, 0.6], [6.4, -20, -0.6]]],
      ["Service ladder", 1, ["ladder", "balanceSpan", "stepEscalator"], 1, [[6.2, -24, -0.7], [5.9, 24, 0.7]]],
      ["Casting-line switchback", 1, ["switchbackRamps", "counterLift", "ledgeTraverse"], 2, [[6.8, 27, 0.8], [7.1, -27, -0.8]]],
      ["Heat-stack ascent", 1, ["thermal", "wallSpring", "fragileDeck"], 1, [[5.6, -18, 0.6], [6.2, 18, -0.6]]],
      ["Breaker gallery", 1, ["breach", "shutters", "slidingSteps"], 0, [[7, 22, -0.7], [6.5, -22, 0.7]]],
      ["Furnace catwalk", 1, ["pistonSteps", "sweeper", "slopeRise"], 1, [[6.4, -28, 0.8], [7.2, 28, -0.8]]],
      ["Cooling-tower traverse", 2, ["stepEscalator", "forwardBelt", "sweeper"], 2, [[7.3, 19, -0.6], [6.1, -19, 0.6]]],
      ["Hot exhaust crossing", 2, ["thermal", "slopeRise", "stepStones"], 1, [[5.9, 31, 0.7], [6.8, -31, -0.7]]],
      ["Service gantry", 2, ["boardingRamp", "wallShaft", "ledgeTraverse"], 0, [[6.7, -21, -0.8], [7.4, 21, 0.8]]],
      ["Drop beneath the press", 2, ["trapdoor", "dropChute", "pistonSteps"], 2, [[7.5, 25, 0.9], [6.4, -25, -0.9]]],
      ["Riveted balance run", 2, ["balanceSpan", "slalom", "switchbackRamps"], 1, [[6.1, -30, 0.6], [7, 30, -0.6]]],
      ["Ash-chute descent", 2, ["dropChute", "fragileDeck", "thermal"], 3, [[7.2, 17, -0.7], [5.8, -17, 0.7]]],
      ["Crane transfer", 2, ["counterLift", "callFerry", "slidingSteps"], 0, [[5.7, 26, 0.8], [6.6, -26, -0.8]]],
      ["Furnace chase", 2, ["lockdown", "sweeper", "breach"], 2, [[6.9, -19, -0.6], [7.3, 19, 0.6]]],
      ["Overhead service route", 2, ["ladder", "glassRun", "wallSpring"], 1, [[7.4, 29, 0.7], [6, -29, -0.7]]],
      ["Pressure release", 2, ["shutters", "pressureDoor", "chargeFloor"], 2, [[6.3, -23, 0.9], [7.5, 23, -0.9]]],
      ["Broken foundry span", 3, ["glassRun", "ledgeTraverse", "stepStones"], 0, [[5.8, 32, -0.6], [6.7, -32, 0.6]]],
      ["Molten-vent climb", 3, ["thermal", "switchbackRamps", "wallShaft"], 1, [[7.1, -27, 0.8], [6.2, 27, -0.8]]],
      ["Last assembly line", 3, ["forwardBelt", "scanner", "breach"], 2, [[6.5, 21, -0.9], [7.4, -21, 0.9]]],
      ["Foundry core", 3, ["chargeRail", "sweeper", "lockdown"], 1, [[7.6, -20, 0.7], [6.5, 20, -0.7]]],
    ],
  },
  {
    chapter: "Switchyard",
    courses: [
      ["Switch house approach", 1, ["routeSwitch", "slidingSteps", "stepStones"], 0, [[6.3, -22, 0.6], [7.2, 22, -0.6]]],
      ["Ferry signal", 1, ["callFerry", "boardingRamp", "balanceSpan"], 1, [[7.4, 28, -0.8], [6.1, -28, 0.8]]],
      ["Freight-car transfer", 1, ["forwardBelt", "wallSpring", "shutters"], 2, [[5.9, 18, 0.7], [6.7, -18, -0.7]]],
      ["Signal bridge", 1, ["glassRun", "slalom", "crossfireLane"], 1, [[6.8, -31, -0.6], [7.5, 31, 0.6]]],
      ["Overhead line walk", 1, ["ladder", "slidingSteps", "routeSwitch"], 0, [[7.6, 24, 0.9], [6.3, -24, -0.9]]],
      ["Turntable crossing", 1, ["carousel", "stepEscalator", "callFerry"], 1, [[6.1, -26, -0.7], [7, 26, 0.7]]],
      ["Rail-shed breach", 2, ["sweeper", "slidingSteps", "breach"], 2, [[7.2, 32, 0.6], [5.9, -32, -0.6]]],
      ["Raised platform relay", 2, ["chargeRail", "airRelay", "ledgeTraverse"], 1, [[5.7, -20, 0.8], [6.4, 20, -0.8]]],
      ["Pressure-door siding", 2, ["pressureDoor", "boardingRamp", "wallShaft"], 0, [[6.6, 29, -0.9], [7.3, -29, 0.9]]],
      ["Split-track descent", 2, ["switchbackRamps", "forwardBelt", "glassRun"], 2, [[7.5, -17, 0.7], [6.2, 17, -0.7]]],
      ["Memory of the route", 2, ["memoryGrid", "routeSwitch", "stepStones"], 1, [[6, 25, -0.6], [7.6, -25, 0.6]]],
      ["Portal freight loop", 2, ["shutters", "transitPortals", "slidingSteps"], 3, [[6.9, -28, 0.9], [5.8, 28, -0.9]]],
      ["Crosswind signals", 2, ["headwind", "crossfireLane", "chargeRail"], 0, [[7.3, 21, -0.8], [6.5, -21, 0.8]]],
      ["Ferry-yard return", 2, ["callFerry", "carousel", "balanceSpan"], 1, [[5.8, 30, 0.6], [7.1, -30, -0.6]]],
      ["Lockdown platform", 2, ["lockdown", "sweeper", "slidingSteps"], 2, [[6.5, -19, 0.9], [7.4, 19, -0.9]]],
      ["Piston service stairs", 2, ["pistonSteps", "wallSpring", "ladder"], 1, [[7.1, 27, -0.7], [6, -27, 0.7]]],
      ["Gust through the glass", 3, ["gustGates", "glassRun", "forwardBelt"], 0, [[5.6, -32, 0.8], [6.8, 32, -0.8]]],
      ["Sunken carriage", 3, ["dropChute", "boardingRamp", "slopeRise"], 1, [[6.7, 23, -0.9], [7.5, -23, 0.9]]],
      ["Last signal gantry", 3, ["scanner", "routeSwitch", "crossfireLane"], 2, [[7.6, -24, 0.6], [6.3, 24, -0.6]]],
      ["Switchyard control", 3, ["relayButtons", "transitPortals", "sweeper"], 1, [[6.2, 18, -0.8], [7.2, -18, 0.8]]],
    ],
  },
  {
    chapter: "Spillway",
    courses: [
      ["Basin stepping route", 1, ["stepStones", "coolant", "ladder"], 0, [[5.8, 24, 0.8], [6.5, -24, -0.8]]],
      ["Wet-slope traverse", 1, ["slopeRise", "slickTurn", "balanceSpan"], 1, [[6.7, -19, -0.9], [7.4, 19, 0.9]]],
      ["Overflow channel", 1, ["coolant", "airRelay", "dropChute"], 2, [[7.4, 28, 0.7], [6.1, -28, -0.7]]],
      ["Broken weir crossing", 1, ["stepStones", "wallSpring", "coolant"], 1, [[6, -32, -0.8], [7, 32, 0.8]]],
      ["Intake gantry", 1, ["counterLift", "boardingRamp", "slalom"], 0, [[7.2, 20, 0.9], [5.9, -20, -0.9]]],
      ["Sluice ladder descent", 1, ["dropChute", "ladder", "stepEscalator"], 1, [[5.6, -26, -0.7], [6.8, 26, 0.7]]],
      ["Floodgate balance", 2, ["balanceSpan", "slickTurn", "glassRun"], 2, [[6.5, 31, 0.8], [7.5, -31, -0.8]]],
      ["Mist-shaft leap", 2, ["lowGravity", "stepStones", "airRelay"], 1, [[7.6, -22, -0.9], [6.2, 22, 0.9]]],
      ["Underflow tunnel", 2, ["trapdoor", "coolant", "wallShaft"], 0, [[6.1, 18, 0.6], [7.3, -18, -0.6]]],
      ["Spillway service lift", 2, ["sweeper", "callFerry", "slopeRise"], 2, [[6.9, -29, -0.8], [5.8, 29, 0.8]]],
      ["Three safe stones", 2, ["memoryGrid", "stepStones", "coolant"], 1, [[7.3, 25, 0.9], [6.6, -25, -0.9]]],
      ["Warm vent above the basin", 2, ["thermal", "counterLift", "balanceSpan"], 3, [[5.9, -21, -0.7], [7.2, 21, 0.7]]],
      ["Low-gravity cascade", 2, ["lowGravity", "wallSpring", "dropChute"], 0, [[6.6, 32, 0.8], [6, -32, -0.8]]],
      ["Glass-runnel crossing", 2, ["glassRun", "ladder", "boardingRamp"], 1, [[7.5, -18, -0.9], [6.9, 18, 0.9]]],
      ["Slick return channel", 2, ["slickTurn", "stepEscalator", "slalom"], 2, [[6.2, 27, 0.7], [7.6, -27, -0.7]]],
      ["Protected heat sluice", 2, ["protectionCell", "chargeFloor", "coolant"], 1, [[7.1, -24, -0.8], [5.7, 24, 0.8]]],
      ["Cascade service route", 3, ["slalom", "coolant", "switchbackRamps"], 0, [[5.7, 30, 0.9], [6.4, -30, -0.9]]],
      ["Belt-driven outflow", 3, ["forwardBelt", "trapdoor", "coolant"], 1, [[6.8, -20, -0.6], [7.5, 20, 0.6]]],
      ["Final weir traverse", 3, ["scanner", "stepStones", "slalom"], 2, [[7.4, 23, 0.8], [6.1, -23, -0.8]]],
      ["Spillway heart", 3, ["chargeRail", "sweeper", "dropChute"], 1, [[6, -28, -0.9], [7.3, 28, 0.9]]],
    ],
  },
  {
    chapter: "Relay",
    courses: [
      ["Outer relay walk", 1, ["chargeRail", "headwind", "ledgeTraverse"], 0, [[6.5, 18, 0.6], [7.4, -18, -0.6]]],
      ["Antenna service climb", 1, ["ladder", "switchbackRamps", "balanceSpan"], 1, [[7.2, -27, -0.8], [6, 27, 0.8]]],
      ["Drift chamber", 1, ["lowGravity", "airRelay", "ledgeTraverse"], 2, [[5.8, 31, 0.7], [6.7, -31, -0.7]]],
      ["Solar array crossing", 1, ["glassRun", "slidingSteps", "slalom"], 1, [[6.9, -22, -0.6], [7.5, 22, 0.6]]],
      ["Comms mast switchback", 1, ["switchbackRamps", "wallShaft", "stepEscalator"], 0, [[7.6, 26, 0.9], [6.3, -26, -0.9]]],
      ["Magnetic transfer", 1, ["boardingRamp", "chargeRail", "wallSpring"], 1, [[6.1, -30, -0.7], [7.2, 30, 0.7]]],
      ["Windward service deck", 2, ["headwind", "balanceSpan", "ladder"], 2, [[7.3, 20, 0.8], [5.9, -20, -0.8]]],
      ["Boost-ring approach", 2, ["runup", "catapult", "stepStones"], 1, [[5.6, -24, -0.6], [6.8, 24, 0.6]]],
      ["Adhesion field crossing", 2, ["dragStrip", "wallSpring", "ledgeTraverse"], 0, [[6.7, 32, 0.9], [7.4, -32, -0.9]]],
      ["Orbital cargo lift", 2, ["counterLift", "stepEscalator", "boardingRamp"], 2, [[7.5, -19, -0.8], [6.2, 19, 0.8]]],
      ["Timed antenna shutters", 2, ["shutters", "pulseDeck", "airRelay"], 1, [[6, 28, 0.7], [7.6, -28, -0.7]]],
      ["Cross-current route", 2, ["gustGates", "routeSwitch", "chargeRail"], 3, [[6.8, -25, -0.9], [5.8, 25, 0.9]]],
      ["Outer hull drop", 2, ["dropChute", "boardingRamp", "wallShaft"], 0, [[7.4, 21, 0.6], [6.5, -21, -0.6]]],
      ["Floating service spans", 2, ["carousel", "lowGravity", "glassRun"], 1, [[5.9, -31, -0.7], [7.3, 31, 0.7]]],
      ["Power-cell traverse", 2, ["accessCells", "slidingSteps", "ladder"], 2, [[6.6, 23, 0.8], [6.1, -23, -0.8]]],
      ["Exhaust plume ascent", 2, ["thermal", "counterLift", "switchbackRamps"], 1, [[7.1, -18, -0.6], [7.5, 18, 0.6]]],
      ["Vacuum-side balance", 3, ["balanceSpan", "headwind", "ledgeTraverse"], 0, [[5.7, 29, 0.9], [6.4, -29, -0.9]]],
      ["Relay maintenance loop", 3, ["callFerry", "transitPortals", "wallSpring"], 1, [[6.9, -26, -0.8], [7.2, 26, 0.8]]],
      ["Core approach", 3, ["inhibitor", "scanner", "runup"], 2, [[7.6, 22, 0.7], [5.9, -22, -0.7]]],
      ["Relay core", 3, ["chargeRail", "stepEscalator", "sweeper"], 1, [[6.2, -32, -0.9], [6.8, 32, 0.9]]],
    ],
  },
  {
    chapter: "Causeway",
    courses: [
      ["Old road approach", 1, ["slopeRise", "stepStones", "balanceSpan"], 0, [[6.2, 28, 0.8], [7.3, -28, -0.8]]],
      ["Broken parapet", 1, ["ledgeTraverse", "wallSpring", "slalom"], 1, [[7.5, -20, -0.7], [6, 20, 0.7]]],
      ["Causeway fork", 1, ["forks", "balanceSpan", "stepEscalator"], 2, [[5.7, 32, 0.9], [6.5, -32, -0.9]]],
      ["Flooded arch", 1, ["coolant", "dropChute", "ladder"], 1, [[6.8, -24, -0.8], [7.4, 24, 0.8]]],
      ["Pillar-to-pillar crossing", 1, ["stepStones", "airRelay", "wallShaft"], 0, [[7.3, 19, 0.6], [5.9, -19, -0.6]]],
      ["Collapsed rampart", 1, ["switchbackRamps", "glassRun", "boardingRamp"], 1, [[5.9, -29, -0.9], [6.8, 29, 0.9]]],
      ["Wind-cut bridge", 2, ["headwind", "balanceSpan", "stepStones"], 2, [[6.6, 23, 0.7], [7.6, -23, -0.7]]],
      ["Ruin courtyard route", 2, ["routeSwitch", "stepStones", "forks"], 1, [[7.4, -31, -0.6], [6.2, 31, 0.6]]],
      ["Lower arch descent", 2, ["dropChute", "trapdoor", "slickTurn"], 0, [[6, 21, 0.9], [7.1, -21, -0.9]]],
      ["Twin portal crossing", 2, ["transitPortals", "slalom", "ledgeTraverse"], 2, [[6.9, -27, -0.8], [5.8, 27, 0.8]]],
      ["Stone stair traverse", 2, ["stepEscalator", "switchbackRamps", "balanceSpan"], 1, [[7.6, 25, 0.7], [6.5, -25, -0.7]]],
      ["Broken aqueduct", 2, ["coolant", "stepStones", "catapult"], 3, [[5.8, -18, -0.6], [7.3, 18, 0.6]]],
      ["Ridge-side route", 2, ["ledgeTraverse", "wallShaft", "slopeRise"], 0, [[6.4, 30, 0.8], [5.9, -30, -0.8]]],
      ["Falling masonry", 2, ["fragileDeck", "sweeper", "wallSpring"], 1, [[7.2, -22, -0.9], [6.8, 22, 0.9]]],
      ["Gatehouse crossing", 2, ["pressureDoor", "shutters", "routeSwitch"], 2, [[6.1, 26, 0.6], [7.5, -26, -0.6]]],
      ["Long exposed span", 2, ["gustGates", "glassRun", "stepStones"], 1, [[7.5, -32, -0.7], [6, 32, 0.7]]],
      ["High causeway return", 3, ["ledgeTraverse", "switchbackRamps", "balanceSpan"], 0, [[5.6, 20, 0.9], [6.7, -20, -0.9]]],
      ["Crumbling waterside", 3, ["fragileDeck", "coolant", "dropChute"], 1, [[6.7, -28, -0.8], [7.4, 28, 0.8]]],
      ["Exit-side rampart", 3, ["scanner", "forks", "wallSpring"], 2, [[7.3, 24, 0.6], [5.8, -24, -0.6]]],
      ["Causeway keep", 3, ["transitPortals", "sweeper", "chargeRail"], 1, [[6, -19, -0.9], [7.1, 19, 0.9]]],
    ],
  },
  {
    chapter: "Silo",
    courses: [
      ["Silo apron", 1, ["slopeRise", "stepEscalator", "wallShaft"], 0, [[6.8, 22, 0.9], [7.4, -22, -0.9]]],
      ["Inspection ladder", 1, ["ladder", "balanceSpan", "stepStones"], 1, [[7.4, -31, -0.8], [6.2, 31, 0.8]]],
      ["Lift shaft transfer", 1, ["counterLift", "wallShaft", "ledgeTraverse"], 2, [[5.9, 27, 0.7], [6.8, -27, -0.7]]],
      ["Vent-stack ascent", 1, ["thermal", "stepEscalator", "slopeRise"], 1, [[7.1, -18, -0.9], [5.8, 18, 0.9]]],
      ["Silo catwalks", 1, ["pistonSteps", "slidingSteps", "ladder"], 0, [[6.4, 32, 0.8], [7.5, -32, -0.8]]],
      ["Grain chute descent", 1, ["dropChute", "trapdoor", "stepStones"], 1, [[5.7, -25, -0.6], [6.6, 25, 0.6]]],
      ["Suspended loading deck", 2, ["boardingRamp", "carousel", "balanceSpan"], 2, [[7.6, 20, 0.9], [6.1, -20, -0.9]]],
      ["Pressure-vessel traverse", 2, ["pressureDoor", "shutters", "glassRun"], 1, [[6.1, -29, -0.7], [7.3, 29, 0.7]]],
      ["Piston liftwell", 2, ["pistonSteps", "counterLift", "wallShaft"], 0, [[7.3, 24, 0.8], [5.9, -24, -0.8]]],
      ["Emergency ladder route", 2, ["ladder", "shutters", "switchbackRamps"], 2, [[5.8, -32, -0.9], [6.7, 32, 0.9]]],
      ["Silo roof gap", 2, ["catapult", "stepStones", "wallSpring"], 1, [[6.6, 19, 0.6], [7.5, -19, -0.6]]],
      ["Conveyor transfer", 2, ["forwardBelt", "routeSwitch", "boardingRamp"], 3, [[7.5, -27, -0.8], [6, 27, 0.8]]],
      ["Dusty upper gallery", 2, ["gustGates", "balanceSpan", "stepEscalator"], 0, [[6, 30, 0.9], [7.2, -30, -0.9]]],
      ["Descending service cage", 2, ["callFerry", "dropChute", "glassRun"], 1, [[7.2, -21, -0.6], [5.7, 21, 0.6]]],
      ["Grain-lock sequence", 2, ["accessCells", "pressureDoor", "slalom"], 2, [[5.6, 26, 0.8], [6.5, -26, -0.8]]],
      ["Tower access route", 2, ["boardingRamp", "slopeRise", "wallShaft"], 1, [[6.9, -24, -0.9], [7.6, 24, 0.9]]],
      ["Rotating roof span", 3, ["sweeper", "balanceSpan", "switchbackRamps"], 0, [[7.4, 18, 0.7], [6.2, -18, -0.7]]],
      ["Last silo stairwell", 3, ["stepEscalator", "memoryGrid", "dropChute"], 1, [[5.9, -30, -0.8], [7.1, 30, 0.8]]],
      ["Silo defense deck", 3, ["scanner", "crossfireLane", "breach"], 2, [[6.5, 28, 0.9], [5.8, -28, -0.9]]],
      ["Silo control chamber", 3, ["lockdown", "switchbackRamps", "chargeRail"], 1, [[7.6, -22, -0.7], [6.8, 22, 0.7]]],
    ],
  },
  {
    chapter: "Outworks",
    courses: [
      ["Outer shelf approach", 1, ["stepStones", "wallShaft", "slalom"], 0, [[5.7, 20, 0.6], [6.6, -20, -0.6]]],
      ["Rootline traverse", 1, ["ledgeTraverse", "wallSpring", "balanceSpan"], 1, [[6.6, -28, -0.9], [7.5, 28, 0.9]]],
      ["Split ravine route", 1, ["forks", "stepStones", "airRelay"], 2, [[7.3, 31, 0.8], [6.1, -31, -0.8]]],
      ["Spring-fed hollow", 1, ["coolant", "slickTurn", "ladder"], 1, [[5.9, -22, -0.7], [7.2, 22, 0.7]]],
      ["Broken ridge", 1, ["switchbackRamps", "wallShaft", "stepStones"], 0, [[6.8, 25, 0.9], [5.8, -25, -0.9]]],
      ["Wind-carved ledges", 1, ["headwind", "slalom", "boardingRamp"], 1, [[7.5, -19, -0.6], [6.9, 19, 0.6]]],
      ["Canopy lift", 2, ["counterLift", "airRelay", "stepEscalator"], 2, [[6.1, 32, 0.7], [7.4, -32, -0.7]]],
      ["Stone memory path", 2, ["memoryGrid", "stepStones", "lowGravity"], 1, [[7.2, -26, -0.8], [6, 26, 0.8]]],
      ["Buried passage", 2, ["trapdoor", "dropChute", "wallSpring"], 0, [[5.8, 23, 0.9], [6.7, -23, -0.9]]],
      ["Suspended leaf-span", 2, ["carousel", "balanceSpan", "catapult"], 2, [[6.7, -30, -0.7], [7.6, 30, 0.7]]],
      ["Narrow ravine crossing", 2, ["glassRun", "ledgeTraverse", "slalom"], 1, [[7.4, 18, 0.6], [5.9, -18, -0.6]]],
      ["Waterfall service traverse", 2, ["thermal", "slalom", "switchbackRamps"], 3, [[6, -24, -0.9], [7.3, 24, 0.9]]],
      ["Cliffside switchback", 2, ["switchbackRamps", "routeSwitch", "wallShaft"], 0, [[6.5, 29, 0.8], [6.2, -29, -0.8]]],
      ["Fallen bridge return", 2, ["callFerry", "stepStones", "boardingRamp"], 1, [[7.6, -21, -0.6], [6.8, 21, 0.6]]],
      ["Spore-gate route", 2, ["shutters", "pulseDeck", "slickTurn"], 2, [[5.6, 27, 0.9], [7.5, -27, -0.9]]],
      ["Exposed shelf crossing", 2, ["gustGates", "wallSpring", "balanceSpan"], 1, [[6.9, -32, -0.8], [5.7, 32, 0.8]]],
      ["High-canopy traverse", 3, ["ladder", "ledgeTraverse", "stepStones"], 0, [[7.3, 22, 0.7], [6.5, -22, -0.7]]],
      ["Cracked shelf descent", 3, ["fragileDeck", "dropChute", "slalom"], 1, [[5.9, -18, -0.6], [7.4, 18, 0.6]]],
      ["Outwork perimeter", 3, ["crossfireLane", "sweeper", "routeSwitch"], 2, [[6.6, 26, 0.8], [6.1, -26, -0.8]]],
      ["Outworks heart", 3, ["airRelay", "wallShaft", "chargeRail"], 1, [[7.5, -23, -0.9], [6.9, 23, 0.9]]],
    ],
  },
  {
    chapter: "Interchange",
    courses: [
      ["Hangar service entry", 1, ["boardingRamp", "stepStones", "ladder"], 0, [[6.1, -29, 0.8], [7.2, 29, -0.8]]],
      ["Cargo lift access", 1, ["counterLift", "ladder", "balanceSpan"], 1, [[7.2, 21, -0.7], [5.8, -21, 0.7]]],
      ["Docking-bay traverse", 1, ["callFerry", "slidingSteps", "ledgeTraverse"], 2, [[5.8, -18, 0.6], [6.7, 18, -0.6]]],
      ["Pressure hull crossing", 1, ["pressureDoor", "slalom", "wallSpring"], 1, [[6.6, 32, -0.9], [7.5, -32, 0.9]]],
      ["Cargo sling transfer", 1, ["carousel", "boardingRamp", "stepEscalator"], 0, [[7.5, -24, 0.7], [6, 24, -0.7]]],
      ["Emergency hull breach", 1, ["breach", "dropChute", "boardingRamp"], 1, [[5.9, 27, -0.8], [7.4, -27, 0.8]]],
      ["Magnetic rail deck", 2, ["forwardBelt", "chargeRail", "routeSwitch"], 2, [[6.8, -20, 0.9], [6.2, 20, -0.9]]],
      ["Low-gravity gantry", 2, ["lowGravity", "airRelay", "balanceSpan"], 1, [[7.4, 30, -0.6], [5.7, -30, 0.6]]],
      ["Glass observation bridge", 2, ["glassRun", "slalom", "stepStones"], 0, [[6, -25, 0.8], [7.1, 25, -0.8]]],
      ["Shuttle approach", 2, ["transitPortals", "boardingRamp", "wallShaft"], 2, [[7.6, 19, -0.9], [6.5, -19, 0.9]]],
      ["Robotic assembly traverse", 2, ["sweeper", "pistonSteps", "slidingSteps"], 1, [[6.3, -31, 0.7], [7.3, 31, -0.7]]],
      ["Fuel-cell service route", 2, ["accessCells", "slalom", "stepEscalator"], 3, [[5.7, 23, -0.6], [6.8, -23, 0.6]]],
      ["Outer docking ring", 2, ["headwind", "balanceSpan", "slalom"], 0, [[7.1, -28, 0.9], [5.9, 28, -0.9]]],
      ["Maintenance crawlway", 2, ["shutters", "pulseDeck", "ladder"], 1, [[6.5, 18, -0.8], [7.5, -18, 0.8]]],
      ["Cargo transfer loop", 2, ["callFerry", "routeSwitch", "carousel"], 2, [[7.3, -22, 0.6], [6.1, 22, -0.6]]],
      ["Airlock sequence", 2, ["lockdown", "pressureDoor", "breach"], 1, [[5.8, 29, -0.7], [7.2, -29, 0.7]]],
      ["Hull-side ascent", 3, ["ladder", "switchbackRamps", "ledgeTraverse"], 0, [[6.9, -26, 0.8], [5.6, 26, -0.8]]],
      ["Final hangar traverse", 3, ["crossfireLane", "glassRun", "forwardBelt"], 1, [[7.5, 24, -0.9], [6.7, -24, 0.9]]],
      ["Reactor approach", 3, ["scanner", "inhibitor", "chargeRail"], 2, [[6.2, -19, 0.7], [7.6, 19, -0.7]]],
      ["Interchange core", 3, ["transitPortals", "sweeper", "stepEscalator"], 1, [[7.4, 32, -0.8], [6, -32, 0.8]]],
    ],
  },
  {
    chapter: "Blackline",
    courses: [
      ["Factory perimeter", 1, ["slopeRise", "stepStones", "ledgeTraverse"], 0, [[7.3, 30, 0.9], [6.1, -30, -0.9]]],
      ["Security stair", 1, ["stepEscalator", "ladder", "shutters"], 1, [[6, -20, -0.7], [7.5, 20, 0.7]]],
      ["Conveyor split", 1, ["forwardBelt", "routeSwitch", "wallSpring"], 2, [[6.7, 25, 0.8], [5.8, -25, -0.8]]],
      ["Inspection gantry", 1, ["stepStones", "glassRun", "slidingSteps"], 1, [[7.5, -32, -0.9], [6.6, 32, 0.9]]],
      ["Outer press line", 1, ["pistonSteps", "sweeper", "slalom"], 0, [[5.8, 22, 0.7], [7.3, -22, -0.7]]],
      ["Drop into the service bay", 1, ["dropChute", "trapdoor", "boardingRamp"], 1, [[6.5, -28, -0.8], [6, 28, 0.8]]],
      ["Targeted breach route", 2, ["shotRelease", "breach", "ledgeTraverse"], 2, [[7.6, 18, 0.9], [6.9, -18, -0.9]]],
      ["Lock-and-lift crossing", 2, ["relayButtons", "counterLift", "wallShaft"], 1, [[5.9, -24, -0.6], [7.4, 24, 0.6]]],
      ["Hazard-floor traverse", 2, ["protectionCell", "chargeFloor", "stepStones"], 0, [[6.8, 31, 0.8], [5.7, -31, -0.8]]],
      ["Memory gate sequence", 2, ["memoryGrid", "pressureDoor", "routeSwitch"], 2, [[7.2, -19, -0.9], [6.5, 19, 0.9]]],
      ["Glass furnace bridge", 2, ["thermal", "glassRun", "balanceSpan"], 1, [[6.1, 27, 0.7], [7.6, -27, -0.7]]],
      ["Pursuit through the line", 2, ["lockdown", "forwardBelt", "sweeper"], 3, [[7.4, -23, -0.8], [5.9, 23, 0.8]]],
      ["Portal-side inspection", 2, ["transitPortals", "scanner", "wallSpring"], 0, [[5.7, 32, 0.9], [6.8, -32, -0.9]]],
      ["Missile-bay catwalk", 2, ["boardingRamp", "switchbackRamps", "slidingSteps"], 1, [[6.6, -21, -0.6], [7.5, 21, 0.6]]],
      ["Crossfire service aisle", 2, ["crossfireLane", "shutters", "stepEscalator"], 2, [[7.5, 26, 0.8], [6.2, -26, -0.8]]],
      ["Final assembly descent", 2, ["switchbackRamps", "dropChute", "fragileDeck"], 1, [[6.2, -30, -0.9], [7.1, 30, 0.9]]],
      ["Blackline upper gantry", 3, ["headwind", "wallShaft", "chargeRail"], 0, [[5.8, 20, 0.6], [6.7, -20, -0.6]]],
      ["Reactor-side traverse", 3, ["inhibitor", "lowGravity", "airRelay"], 1, [[7.1, -27, -0.8], [5.6, 27, 0.8]]],
      ["Last defense corridor", 3, ["scanner", "crossfireLane", "lockdown"], 2, [[6.4, 29, 0.9], [7.3, -29, -0.9]]],
      ["Blackline core", 3, ["chargeRail", "sweeper", "breach"], 1, [[7.6, -22, -0.7], [6, 22, 0.7]]],
    ],
  },
];

// Optional enemy encounters are deliberately sparse, irregularly spaced rest points in traversal.
// Chapter bosses always get an arena regardless of this list.
const ENCOUNTER_COURSES = new Set([
  22, 29, 35, 37, 40,
  42, 45, 53, 57, 60,
  62, 68, 71, 77, 80,
  83, 86, 94, 97, 100,
  102, 107, 114, 117, 120,
  122, 129, 132, 138, 140,
  142, 148, 153, 157, 160,
  163, 166, 174, 179, 180,
  182, 188, 191, 197, 200,
]);

const validObstacleIds = new Set(gauntletObstacleIds);
const CONNECTOR_WIDTH = 8;
const CONNECTOR_EDGE_CLEARANCE = 4;
const CONNECTOR_MAX_SLOPE = 0.17;
const connectorProfiles = new Set();
const obstacleCombinations = new Set();
const journeyNames = new Set();
const CONNECTOR_LENGTH_SHAPES = Object.freeze([
  [0.25, 0.25, 0.25, 0.25],
  [0.31, 0.19, 0.24, 0.26],
  [0.2, 0.3, 0.3, 0.2],
  [0.28, 0.22, 0.18, 0.32],
  [0.24, 0.32, 0.2, 0.24],
  [0.3, 0.2, 0.27, 0.23],
]);
const CONNECTOR_TURN_SHAPES = Object.freeze([
  [0.55, 0.45, -0.3, -0.7],
  [0.85, -0.15, -0.3, -0.4],
  [0.35, -0.7, 0.6, -0.25],
  [-0.4, -0.6, 0.45, 0.55],
  [0, 0.75, -0.25, -0.5],
  [0.65, 0.15, -0.9, 0.1],
]);
const CONNECTOR_RISE_SHAPES = Object.freeze([
  [0.3, 0.7, -0.4, -0.6],
  [0.65, 0.35, -0.55, -0.45],
  [0.25, -0.2, 0.7, -0.75],
  [-0.3, -0.7, 0.45, 0.55],
  [0, 0.6, -0.25, -0.35],
  [0.55, -0.1, -0.7, 0.25],
]);
const ROUTE_WIDTH_BY_TIER = Object.freeze({ 1: 5.8, 2: 4.2, 3: 2.95, 4: 2.6, 5: 2.35 });
const MAX_AUTHORED_JUMP_GAP = 4.2;
const JUMP_SAFETY_MARGIN = 0.12;
const FORBIDDEN_GAUNTLET_OBSTACLES = new Set(["ceilingHops", "jetRise", "jetRefuel"]);

function stableSeed(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function connectorRoute(connector, level, journey, fromId, toId, transition, tier) {
  const [lead, counter] = connector;
  const totalLength = lead[0] + counter[0];
  const routeSeed = stableSeed(`${level}:${journey}:${fromId}>${toId}:${transition}`);
  const shapeIndex = routeSeed % CONNECTOR_LENGTH_SHAPES.length;
  const lengthBias = (lead[0] - counter[0]) * 0.035;
  const lengths = CONNECTOR_LENGTH_SHAPES[shapeIndex].map((fraction, index) =>
    totalLength * fraction + (index === 0 || index === 3 ? lengthBias : -lengthBias));
  const width = ROUTE_WIDTH_BY_TIER[tier];
  const maxSafeTurn = Math.min(...lengths.map(len =>
    len / (width / 2 + CONNECTOR_EDGE_CLEARANCE) * 180 / Math.PI));
  const turnMagnitude = Math.min(Math.abs(lead[1]), maxSafeTurn) * 0.86;
  const minimumLength = Math.min(...lengths);
  const riseMagnitude = Math.min(Math.abs(lead[2]), minimumLength * CONNECTOR_MAX_SLOPE * 0.82);
  const turnShape = CONNECTOR_TURN_SHAPES[(routeSeed >>> 5) % CONNECTOR_TURN_SHAPES.length];
  const riseShape = CONNECTOR_RISE_SHAPES[(routeSeed >>> 11) % CONNECTOR_RISE_SHAPES.length];
  const direction = Math.sign(lead[1] || 1) * (transition % 2 ? -1 : 1);
  const elevation = Math.sign(lead[2] || 1);

  return {
    t: "route",
    kind: tier === 1 ? "deck" : "beam",
    w: width,
    legs: lengths.map((len, index) => ({
      len,
      turn: turnMagnitude * turnShape[index] * direction,
      rise: riseMagnitude * riseShape[index] * elevation,
    })),
  };
}

function gapCrossing(level, journey, transition, fromId, toId) {
  const progress = (level - 1) / 199;
  const seed = stableSeed(`${level}:${journey}:${fromId}>${toId}:${transition}:crossing`);
  const islands = Math.min(5, 2 + Math.floor(progress * 3) + ((seed >>> 5) & 1));
  const variation = (seed % 3) - 1;
  const width = Math.max(2.55, Math.min(3.7, 3.7 - progress * 1.05 + variation * 0.1));
  const lateralStep = Math.min(0.95, width * 0.23) * (islands > 3 ? 2 : islands > 2 ? 1 : 0);
  const heightStep = islands > 3 ? 0.41 : islands > 2 ? 0.28 : 0;
  const safeGap = Math.sqrt(Math.max(0,
    MAX_AUTHORED_JUMP_GAP ** 2 - lateralStep ** 2 - heightStep ** 2)) - JUMP_SAFETY_MARGIN;
  return {
    t: "pads",
    n: islands,
    len: Math.max(2.65, Math.min(3.45, 3.45 - progress * 0.65 + variation * 0.07)),
    gap: Math.min(safeGap, MAX_AUTHORED_JUMP_GAP - 0.05, 3.45 + progress * 0.7 + variation * 0.035),
    w: width,
    gauntletChallenge: true,
  };
}

function maxSafeCrossingGap(segment) {
  const lateralStep = Math.min(0.95, segment.w * 0.23) * (segment.n > 3 ? 2 : segment.n > 2 ? 1 : 0);
  const heightStep = segment.n > 3 ? 0.41 : segment.n > 2 ? 0.28 : 0;
  return Math.sqrt(Math.max(0,
    MAX_AUTHORED_JUMP_GAP ** 2 - lateralStep ** 2 - heightStep ** 2)) - JUMP_SAFETY_MARGIN;
}

function openingCoursesWithChallenge(firstTwenty) {
  return firstTwenty.slice(0, GAUNTLET_CHAPTER_SIZE).map((course, index) => {
    if (!course || !Array.isArray(course.segs)) {
      throw new Error(`Invalid opening Gauntlet course at level ${index + 1}`);
    }
    const level = index + 1;
    const crossing = gapCrossing(level, course.journey || course.name || `opening-${level}`, 1, "opening", "exit");
    const targetRun = course.segs.findLastIndex(segment => segment.t === "run"
      && Number.isFinite(segment.len) && segment.len >= 7
      && Math.abs(segment.turn || 0) < 1e-6 && Math.abs(segment.rise || 0) < 1e-6);
    let inserted = false;
    const runWidth = 6.8 - (level - 1) / (GAUNTLET_CHAPTER_SIZE - 1) * 0.25;
    const segs = course.segs.map((segment, segmentIndex) => {
      if (segmentIndex === targetRun) {
        inserted = true;
        return crossing;
      }
      if (segment.t === "run" && segment.len >= 5.5) {
        return { ...segment, w: Math.min(segment.w || 8, runWidth) };
      }
      return segment;
    });
    if (!inserted) segs.push(crossing);
    return { ...course, segs };
  });
}

function validateChallengeSegments(courses) {
  for (const course of courses) {
    const challenges = course.segs.filter(segment => segment.gauntletChallenge);
    if (!challenges.length || challenges.some(segment => segment.t !== "pads"
        || !Number.isInteger(segment.n) || segment.n < 2 || segment.n > 5
        || !Number.isFinite(segment.len) || segment.len < 2.65 || segment.len > 3.45
        || !Number.isFinite(segment.w) || segment.w < 2.55 || segment.w > 3.7
        || !Number.isFinite(segment.gap) || segment.gap < 3.4
        || segment.gap > Math.min(MAX_AUTHORED_JUMP_GAP - 0.05, maxSafeCrossingGap(segment)))) {
      throw new Error(`Invalid authored Gauntlet gap challenge in ${course.name}`);
    }
  }
}

for (const [chapterIndex, progression] of CURATED_CHAPTERS.entries()) {
  if (progression.chapter !== GAUNTLET_CHAPTERS[chapterIndex + 1] || progression.courses.length !== GAUNTLET_CHAPTER_SIZE) {
    throw new Error(`Invalid Gauntlet progression for ${progression.chapter}`);
  }
  for (const [journey, tier, obstacles, roomAfter, connector] of progression.courses) {
    const lead = connector?.[0];
    const counter = connector?.[1];
    const maxTurn = len => len / (CONNECTOR_WIDTH / 2 + CONNECTOR_EDGE_CLEARANCE) * 180 / Math.PI;
    const validConnector = Array.isArray(connector) && connector.length === 2
      && [lead, counter].every(run => Array.isArray(run) && run.length === 3 && run.every(Number.isFinite))
      && lead[0] >= 5.5 && lead[0] <= 8 && counter[0] >= 5.5 && counter[0] <= 8
      && Math.abs(lead[1]) >= 12 && Math.abs(lead[1]) <= maxTurn(lead[0])
      && Math.abs(counter[1]) <= maxTurn(counter[0])
      && Math.abs(lead[2]) <= lead[0] * CONNECTOR_MAX_SLOPE
      && Math.abs(counter[2]) <= counter[0] * CONNECTOR_MAX_SLOPE
      && Math.abs(lead[1] + counter[1]) < 1e-9
      && Math.abs(lead[2] + counter[2]) < 1e-9;
    if (!journey || tier < 1 || tier > 3 || roomAfter < 0 || roomAfter > obstacles.length
        || obstacles.length < 2 || new Set(obstacles).size !== obstacles.length
        || obstacles.some(id => !validObstacleIds.has(id) || FORBIDDEN_GAUNTLET_OBSTACLES.has(id)) || !validConnector) {
      throw new Error(`Invalid Gauntlet course in ${progression.chapter}: ${journey}`);
    }
    const obstacleCombination = obstacles.slice().sort().join("|");
    if (obstacleCombinations.has(obstacleCombination)) {
      throw new Error(`Duplicate Gauntlet obstacle combination in ${progression.chapter}: ${journey}`);
    }
    obstacleCombinations.add(obstacleCombination);
    if (journeyNames.has(journey)) {
      throw new Error(`Duplicate Gauntlet journey name in ${progression.chapter}: ${journey}`);
    }
    journeyNames.add(journey);
    const signature = JSON.stringify(connector);
    if (connectorProfiles.has(signature)) {
      throw new Error(`Duplicate Gauntlet route profile in ${progression.chapter}: ${journey}`);
    }
    connectorProfiles.add(signature);
  }
}
if (connectorProfiles.size !== CURATED_CHAPTERS.length * GAUNTLET_CHAPTER_SIZE) {
  throw new Error("Every extended Gauntlet course needs a distinct connector profile");
}

export function extendGauntletCourses(firstTwenty) {
  if (!Array.isArray(firstTwenty) || firstTwenty.length < GAUNTLET_CHAPTER_SIZE) {
    throw new Error(`Gauntlet requires ${GAUNTLET_CHAPTER_SIZE} authored opening courses`);
  }
  const courses = openingCoursesWithChallenge(firstTwenty);

  for (const [chapterIndex, progression] of CURATED_CHAPTERS.entries()) {
    for (const [courseIndex, [journey, tier, obstacleIds, roomAfter, connector]] of progression.courses.entries()) {
      const level = GAUNTLET_CHAPTER_SIZE + 1 + chapterIndex * GAUNTLET_CHAPTER_SIZE + courseIndex;
      const campaignTier = level < 41 ? 1 : level < 81 ? 2 : level < 121 ? 3 : level < 161 ? 4 : 5;
      const routeTier = Math.max(tier, campaignTier);
      const boss = level % GAUNTLET_CHAPTER_SIZE === 0;
      const combat = boss || ENCOUNTER_COURSES.has(level);
      const enemies = combat ? 2 + (level * 3 % 5) + Math.floor(routeTier / 2) : 0;
      const relay = progression.chapter === "Relay";
      const connectorTransitions = [1, 2].filter(transition => !combat || transition !== roomAfter);
      const desiredCrossings = level < 81 ? 1 : 2;
      const crossingOffset = stableSeed(`${level}:${journey}:crossing-order`) % connectorTransitions.length;
      const challengeTransitions = new Set(Array.from({ length: Math.min(desiredCrossings, connectorTransitions.length) }, (_, offset) =>
        connectorTransitions[(crossingOffset + offset) % connectorTransitions.length]));
      const segs = [];
      for (let index = 0; index <= obstacleIds.length; index++) {
        if (combat && index === roomAfter) {
          segs.push({ t: "room", len: 17 + level % 6, cover: true, boss });
        }
        if (index < obstacleIds.length) {
          if (index > 0) {
            segs.push(connectorRoute(connector, level, journey, obstacleIds[index - 1], obstacleIds[index], index, routeTier));
            if (challengeTransitions.has(index)) {
              segs.push(gapCrossing(level, journey, index, obstacleIds[index - 1], obstacleIds[index]));
            }
          }
          const sourceId = obstacleIds[index];
          const id = relay && sourceId === "dragStrip" ? "runup" : sourceId;
          segs.push({
            t: "mechanic", id, tier: routeTier,
            mirror: (level + index * 7) % 4 < 2 ? 1 : -1,
            seed: stableSeed(`${progression.chapter}:${journey}:${level}:${index}:${id}`),
          });
        }
      }
      courses.push({
        name: journey,
        chapter: progression.chapter,
        journey,
        z: enemies,
        boss: boss ? 1 : 0,
        hell: level === 200,
        checkpoints: true,
        segs,
      });
    }
  }

  if (courses.length !== GAUNTLET_CHAPTERS.length * GAUNTLET_CHAPTER_SIZE) {
    throw new Error("Curated Gauntlet progression must contain exactly 200 courses");
  }
  validateChallengeSegments(courses);
  if (new Set(courses.map(course => course.name)).size !== courses.length) {
    throw new Error("Every Gauntlet course needs a unique name");
  }
  if (courses.some(course => course.segs.some(segment =>
    segment.t === "mechanic" && FORBIDDEN_GAUNTLET_OBSTACLES.has(segment.id)))) {
    throw new Error("Gauntlet courses cannot require the jet harness or low-ceiling jump sections");
  }
  return courses;
}
