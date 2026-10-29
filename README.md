# BonnaSathi (বন্যাসাথী): flood-preparedness agent for Bangladesh

BonnaSathi ("flood companion") is an AI agent built with the **Strands Agents SDK** and
**Amazon Nova 2 Lite on Amazon Bedrock**. It reads river-flood forecasts for **all 64
districts of Bangladesh** and turns them into checked guidance in **Bengali and English**,
for families and for the local volunteers who read warnings out on village loudspeakers.

## The problem

Every monsoon, the Brahmaputra-Jamuna, Padma and Meghna flood large parts of Bangladesh.
Forecasts exist, but they are technical (cubic metres per second) and rarely reach rural
households as simple steps in their own language. In many villages, warnings still travel
by mosque loudspeaker.

## What it does

- Answers "Is my district at risk?" in Bengali or English, for any of the 64 districts.
- Scans the whole country: "Where is flooding expected?"
- Gives household checklists per risk level (dry food, oral saline, documents, livestock,
  elderly and children first, safe water, snakebites, emergency number 999).
- Produces loudspeaker announcements for volunteers at WARNING and DANGER.
- `monitor.py` scans all districts proactively and writes the day's alerts.
- Coastal districts are told it covers river floods only, and to follow cyclone signals
  from the Bangladesh Meteorological Department.

## How risk is measured

River discharge forecasts (16 days) come from the Open-Meteo Global Flood API (GloFAS v4).
For each district, `build_thresholds.py` picks the largest river near its headquarters and
compares forecasts with that river's own history (2015-2024): WATCH, WARNING and DANGER
are the top 10%, 3% and 1% of days. Safeguards: one extreme forecast run can raise the
level by one step only, and small streams are capped at WATCH.

## Safety by design

- Life-safety text is written and checked by a native Bengali speaker, never generated.
  The model decides when to give guidance; `guidance.py` decides what it says.
- Language is decided by code (Bengali script detection), not by the model.
- After every reply, code checks the language and that the verified guidance is intact;
  if the model changed it, the verified text replaces the reply.
- A rate-limiter hook caps tool calls per question. It never says "you are completely safe".

## Backtest (1995-2024, GloFAS reanalysis)

| District | Result |
|---|---|
| Kurigram, Sirajganj (Brahmaputra-Jamuna) | 7 of 7 major flood years reached DANGER; flood years averaged 3.5x more danger days |
| Sunamganj | caught 1998, 2004, 2007, 2017 |
| Sylhet | missed the June 2022 flash flood |

BonnaSathi is reliable for large river floods. Flash floods in the northeast, driven by
extreme rain over the Meghalaya hills, are a known limitation of the global river model.

## Run it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
aws login
python build_thresholds.py          # once; saves thresholds.json
python agent.py                     # chat in Bengali or English
python monitor.py                   # nationwide scan + alerts
python backtest.py kurigram         # replay 30 years
python export_site.py               # update the website's live map
FLOOD_SIMULATE=kurigram:DANGER python agent.py   # test an alert (clearly labelled)
```

## Project website

`docs/index.html` is a 3D scroll site (GitHub Pages) with an interactive map of all 64
districts, the backtest, and the safety design. `docs/status.json` holds the live status.

## Limitations

- GloFAS is a global model at 5 km resolution; district points are approximate.
- River floods only: not cyclone storm surge, urban waterlogging, or most flash floods.
- Bengali written in Latin letters ("Banglish") is treated as English for now.
- A preparedness aid, not an official warning. Always follow the Flood Forecasting and
  Warning Centre (FFWC) and local authorities.

## Roadmap

Upstream rainfall forecasts for northeast flash floods, shelter locations, SMS alerts via
Amazon SNS, daily scheduling with Amazon EventBridge, and Banglish support.

## Credits

River data: GloFAS (Copernicus Emergency Management Service) via Open-Meteo, CC BY 4.0.
Built for the AWS Builder Center "Strands SDK: Workshop to Ship" hackathon by HKM Fuyad Islam.

## License

MIT
