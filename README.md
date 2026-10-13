# Azat Ազատ — Quit Smoking, Stay Free 🇦🇲

**🌐 Language / Լեզու / Язык:** English · [Հայերեն](README.hy.md) · [Русский](README.ru.md)

**👉 Try it live:** https://rtmalikian.github.io/azat-smokefree/

Azat (Ազատ — *"free"*) is a **free, evidence-based quit-smoking app for Armenia**. No lectures, no shame, no scare tactics — just science-backed tools that respect your choices, in **English, Russian, and casual Eastern Armenian**.

Nearly **1 in 2 men in Armenia smokes**. Azat helps them quit — or cut down gradually — with a personal plan, craving SOS tools, daily reminders, and trophies that keep you going.

## ✨ Features

- **🗺️ Quit plan wizard** — quit completely *or* cut down gradually (research shows both paths work), with quit date, triggers, and auto-generated "if-then" plans
- **🛟 Craving SOS** — the 4 D's (Delay, Deep breathe, Drink water, Do something else), 4-7-8 breathing, 3-minute urge surfing, support-person call
- **🪞 "Why do I smoke?"** — a gentle guided reflection, including the generational question (*did the men in your family smoke?*), matched to coping tools
- **🏔️ Ararat visualization** — smoke literally clears from Mt. Ararat as your smoke-free days grow
- **🎯 Trigger mapper** — 8 Armenia-relevant triggers (morning coffee ☕, alcohol & celebrations 🥂, friends, after meals, stress, work breaks, boredom, driving) with coping strategies
- **🏋️ Exercises** — your reasons, money calculator, values affirmation, support buddy
- **🏆 Trophy system** — 18 achievements: time, money saved, cravings beaten, streaks — including the 🏔️ Ararat trophy at 100 days
- **📚 Learn** — short, honest facts, every claim backed by a linked source
- **🔔 Reminders** — daily local notifications, milestone pings (no server needed)
- **🔒 Privacy-first** — no login, no accounts, no tracking. All data stays in your browser.

## 🧠 Why Azat is different: the anti-boomerang design

Most anti-smoking messages threaten, shame, or scare — and research shows that can **backfire**:

- **No freedom-threatening language.** Controlling language ("you must quit or else") increases anger and psychological reactance — the state that pushes people *toward* the cigarette ([meta-analysis, 53 studies](https://academic.oup.com/hcr/article/52/1/38/8178818)).
- **Gain-framed, never fear-framed.** Benefit-focused messages engage people more than fear appeals ([O'Keefe & Jensen meta-analysis](https://jakobdjensen.com/wp-content/uploads/2016/02/2008_OKeefeJensen_Com-Studies.pdf)). Every screen is about what you *gain*: freedom, money, breath, pride.
- **Fear without efficacy backfires.** So Azat builds self-efficacy first: small wins, trophies, streaks.
- **Motivational-interviewing style.** Your own reasons, your pace, compassion for lapses.
- **Cultural pride, not stigma.** *"Our grandfathers crossed mountains — you can cross one craving."*

## 📊 Evidence base (every claim in the app is cited)

| Claim | Source |
|---|---|
| ~24% of Armenian adults smoke; 52% of men, <2% of women | [WHO / GSTHR Armenia profile](https://gsthr.org/countries/profile/arm/cigarettes/) |
| ~5,500 tobacco deaths/year in Armenia | [UN Task Force — Armenia investment case](https://uniatf.who.int/docs/uniatflibraries/default-document-library/armenia-tc-report.pdf?sfvrsn=cb8dbcd5_3) |
| Health timeline (20 min → 15 years) | [WHO](https://www.who.int/news-room/questions-and-answers/item/tobacco-health-benefits-of-smoking-cessation) · [CDC](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html) |
| Text-message programs raise quit rates 50–60% | [Cochrane, 26 trials](https://www.cochrane.org/evidence/CD006611_can-programmes-delivered-mobile-phones-help-people-stop-smoking) |
| NRT raises quit success 50–60% | [Cochrane, 133 trials](https://www.cochrane.org/evidence/CD000146_can-nicotine-replacement-therapy-nrt-help-people-quit-smoking) |
| If-then plans nearly double quit rates | [Meta-analysis](https://eprints.whiterose.ac.uk/id/eprint/154864/1/LMcWilliams%20meta_anal%20accepted%20manuscript_Health%20Psychology.pdf) |
| Gradual reduction works as well as abrupt quitting | [Cochrane, 22 studies](https://onlinelibrary.wiley.com/doi/10.1111/add.15769) |
| Parental smoking → ~1.7× child uptake odds | [Systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4921023/) |

## 🛠️ Tech

Static PWA — **zero dependencies, zero build step**:

```
index.html  css/style.css
js/  i18n.js  data.js  app.js  notify.js
sw.js  manifest.webmanifest  icons/
```

- Offline-first via service worker · installable on Android & iPhone
- Local notifications (page timers + service worker + Periodic Background Sync); Web Push scaffold ready for phase 2
- Add a language by adding one object to `js/i18n.js`

### Porting to native apps (Capacitor)

```bash
npm i -D @capacitor/cli @capacitor/core
npx cap init azat com.rtmalikian.azat --web-dir=.
npx cap add android; npx cap add ios   # then npx cap sync
```
Notifications live behind `AzatNotify` (`js/notify.js`), so swapping in `@capacitor/local-notifications` touches one file.

## 🤝 Contributing

Issues and PRs welcome. Content rules: every health claim stays cited; tone stays autonomy-supportive (no orders, no shame, no fear); Armenian stays casual Eastern.

### 🗺️ Roadmap — open opportunities for contributors

These aren't assignments with solutions — they're open problems, framed for anyone who wants to shape them:

1. [Real Web Push backend for true background reminders](https://github.com/rtmalikian/azat-smokefree/issues/1)
2. [Just-in-time support — nudge before the craving, not after](https://github.com/rtmalikian/azat-smokefree/issues/2)
3. [Quit-buddy circles that actually work](https://github.com/rtmalikian/azat-smokefree/issues/3)
4. [On-device Armenian conversational coach](https://github.com/rtmalikian/azat-smokefree/issues/4)
5. [Bridge to real-world help in Armenia (quitline, NRT, pharmacies)](https://github.com/rtmalikian/azat-smokefree/issues/5) · good first issue
6. ["Walk it off" — movement as a craving tool](https://github.com/rtmalikian/azat-smokefree/issues/6) · good first issue
7. [A separate, age-appropriate track for teens](https://github.com/rtmalikian/azat-smokefree/issues/7)

Comment on an issue to claim it, or open a new one with your own idea.

## 📄 License

MIT — free for the people of Armenia and everyone else.
