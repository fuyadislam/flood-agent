# Bonnasaathi — Website outcomes

## Immersive 3D landing experience
- [x] Build a polished, immersive 3D scroll-driven landing experience for Bonnasaathi, themed around rivers, rainfall, flood levels and community preparedness.
- [x] Keep animation and rendering performance-conscious, with fallbacks for lower-powered devices and reduced-motion preferences.

## Interactive Bangladesh district map and forecast views
- [x] Present an interactive Bangladesh map covering all 64 districts, with district selection and clearly differentiated NORMAL, WARNING and DANGER risk states (and any other status levels supported by the supplied forecast data).
- [x] For a selected district, present forecast information grounded in the supplied GloFAS river-flood data, including risk context, severity and concise next actions; do not imply the static snapshot is live.
- [x] Provide a national summary that communicates the overall flood outlook and highlights districts requiring attention.

## Bilingual preparedness and community guidance
- [x] Provide Bengali and English switching across district guidance, safety content, navigation and key calls to action.
- [x] Present practical household preparedness checklists organized by flood stage, based on the supplied verified guidance.
- [x] Present volunteer loudspeaker announcements for WARNING and DANGER levels in a format suitable for clear community broadcast.

## Agent, evaluation and safety explanation
- [x] Explain the agent's Strands Agents SDK and Amazon Nova 2 Lite on Amazon Bedrock workflow and how forecasts become localized guidance.
- [x] Present the supplied backtest and reliability information with its historical evaluation context, methodology, limitations and transparent safety design.
- [x] Make limitations explicit: the forecast is for river floods only, the global model has known spatial and flash-flood limitations, and the agent is preparedness support rather than an official warning; direct people to local authorities and official warnings.

## Crisis-accessible responsive experience
- [x] Make the experience responsive and usable under stressful conditions, with readable typography, prominent emergency guidance, keyboard navigation, reduced-motion support and graceful behavior on slow connections.
- [x] Preserve the agent's life-safety principles: never say a person is completely safe, avoid presenting unverified or simulated data as a real warning, and show emergency number 999 for emergencies in Bangladesh.
