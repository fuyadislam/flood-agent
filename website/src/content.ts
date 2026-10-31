import type { Language, RiskLevel } from './types';

export const riskLabel: Record<RiskLevel, Record<Language, string>> = {
  NORMAL: { en: 'Normal', bn: 'স্বাভাবিক' },
  WATCH: { en: 'Watch', bn: 'নজর রাখুন' },
  WARNING: { en: 'Warning', bn: 'সতর্কতা' },
  DANGER: { en: 'Danger', bn: 'বিপদ' },
  UNKNOWN: { en: 'No data', bn: 'তথ্য পাওয়া যায়নি' },
};

export const stageNames: Record<Language, Record<RiskLevel, string>> = {
  en: { NORMAL: 'Plan ahead', WATCH: 'Stay ready', WARNING: 'Get set', DANGER: 'Move to safety', UNKNOWN: 'Forecast unavailable' },
  bn: { NORMAL: 'আগে থেকে প্রস্তুতি', WATCH: 'প্রস্তুত থাকুন', WARNING: 'গুছিয়ে নিন', DANGER: 'নিরাপদ স্থানে যান', UNKNOWN: 'পূর্বাভাস পাওয়া যায়নি' },
};

export const household: Record<RiskLevel, Record<Language, string[]>> = {
  NORMAL: {
    en: ['Keep listening to river news.', 'Before monsoon, keep dry food and important papers ready.'],
    bn: ['নদীর খবর নিয়মিত শুনুন।', 'বর্ষার আগে শুকনো খাবার ও জরুরি কাগজপত্র গুছিয়ে রাখুন।'],
  },
  WATCH: {
    en: ['Listen for updates on radio, loudspeaker and mobile.', 'Keep dry food, drinking water and oral saline ready.', 'Protect your national ID and papers in a plastic bag.', 'Keep phones charged; make sure everyone knows the nearest shelter.'],
    bn: ['রেডিও, মাইকিং ও মোবাইলে বন্যার খবর নিয়মিত শুনুন।', 'শুকনো খাবার, খাবার পানি ও খাওয়ার স্যালাইন জোগাড় রাখুন।', 'জাতীয় পরিচয়পত্র ও জরুরি কাগজ প্লাস্টিকের ব্যাগে রাখুন।', 'মোবাইল চার্জ দিয়ে রাখুন; নিকটের আশ্রয়কেন্দ্রের কথা সবাইকে জানান।'],
  },
  WARNING: {
    en: ['Pack dry food, water, oral saline, medicines and important papers.', 'Arrange to move livestock to higher ground.', 'Plan to move elderly people, people with disabilities, pregnant women and children first.', 'Decide your route to the flood shelter now. In an emergency, call 999.'],
    bn: ['শুকনো খাবার, পানি, স্যালাইন, ওষুধ ও জরুরি কাগজ একটি ব্যাগে গুছিয়ে রাখুন।', 'গবাদি পশু উঁচু জায়গায় নেওয়ার ব্যবস্থা করুন।', 'বয়স্ক, প্রতিবন্ধী, গর্ভবতী নারী ও শিশুদের আগে নিরাপদ জায়গায় নেওয়ার পরিকল্পনা করুন।', 'আশ্রয়কেন্দ্রে যাওয়ার পথ ঠিক করে রাখুন। জরুরি প্রয়োজনে ৯৯৯ নম্বরে ফোন করুন।'],
  },
  DANGER: {
    en: ['Go to the flood shelter or higher ground with your family without delay.', 'Move elderly people, people with disabilities, pregnant women and children first.', 'Do not walk through moving water. Do not drink flood water; use tubewell or boiled water.', 'Watch for snakebites. In an emergency, call 999.'],
    bn: ['দেরি না করে পরিবার নিয়ে আশ্রয়কেন্দ্র বা উঁচু জায়গায় চলে যান।', 'আগে বয়স্ক, প্রতিবন্ধী, গর্ভবতী নারী ও শিশুদের সরিয়ে নিন।', 'স্রোতের পানিতে হাঁটবেন না। বন্যার পানি খাবেন না; টিউবওয়েল বা ফোটানো পানি পান করুন।', 'সাপের কামড় থেকে সাবধান থাকুন। জরুরি প্রয়োজনে ৯৯৯ নম্বরে ফোন করুন।'],
  },
  UNKNOWN: {
    en: ['The forecast is unavailable. Do not guess; follow local authority announcements.'],
    bn: ['বন্যার পূর্বাভাস এখন পাওয়া যাচ্ছে না। অনুমান করবেন না, স্থানীয় প্রশাসনের ঘোষণা শুনুন।'],
  },
};

export const announcements: Partial<Record<'WARNING' | 'DANGER', Record<Language, (district: string, date: string) => string>>> = {
  WARNING: {
    en: (district, date) => `Dear people of ${district}, this is an urgent announcement. The river is rising and flooding may come by ${date}. Pack dry food, water and important papers. Get ready to move your livestock to higher ground. Look after elderly people and children. In an emergency, call 999.`,
    bn: (district, date) => `প্রিয় ${district}বাসী, একটি জরুরি ঘোষণা। নদীর পানি বাড়ছে। ${date} নাগাদ বন্যা হতে পারে। শুকনো খাবার, পানি ও জরুরি কাগজপত্র গুছিয়ে রাখুন। গবাদি পশু উঁচু জায়গায় নেওয়ার প্রস্তুতি নিন। বয়স্ক ও শিশুদের খেয়াল রাখুন। জরুরি প্রয়োজনে ৯৯৯ নম্বরে ফোন করুন।`,
  },
  DANGER: {
    en: (district) => `Dear people of ${district}, this is a danger announcement. The river may reach danger level. Go to the nearest flood shelter or higher ground with your family now. Move elderly people, children and pregnant women first. Take your livestock with you. Do not enter moving water. In an emergency, call 999.`,
    bn: (district) => `প্রিয় ${district}বাসী, বিপদের ঘোষণা। নদীর পানি বিপদের মাত্রায় পৌঁছাতে পারে। এখনই পরিবার নিয়ে নিকটের আশ্রয়কেন্দ্র বা উঁচু জায়গায় চলে যান। আগে বয়স্ক, শিশু ও গর্ভবতী নারীদের সরিয়ে নিন। গবাদি পশু সঙ্গে নিন। স্রোতের পানিতে নামবেন না। জরুরি প্রয়োজনে ৯৯৯ নম্বরে ফোন করুন।`,
  },
};

export const text = {
  en: {
    navMap: 'District outlook', navPrep: 'Get prepared', navAbout: 'How it works', navCta: 'Explore the demo',
    eyebrow: 'BANGLADESH FLOOD PREPAREDNESS · BANGLA + ENGLISH',
    heroLead: 'When the river rises,', heroAccent: 'clarity should arrive first.',
    heroBody: 'A flood companion for families and the local volunteers who keep communities informed. Forecasts become clear next steps—in the language people use.',
    heroPrimary: 'Explore district outlook', heroSecondary: 'Meet your flood companion',
    heroNote: 'A preparedness aid, not an official warning.',
    sceneLabel: 'BANGLADESH · 16-DAY RIVER OUTLOOK', sceneCaption: 'Rivers connect us. Preparedness protects us.',
    stripA: '64 districts', stripB: 'Bengali + English', stripC: 'Verified safety guidance',
    mapKicker: 'THE NATIONAL PICTURE', mapTitle: 'One country. Every district.',
    mapBody: 'Choose a district to see its sample outlook and the next steps that matter. This demo uses the forecast snapshot supplied with your project—not a live feed.',
    snapshot: 'PROJECT SNAPSHOT', updated: 'Snapshot generated', latest: 'District outlook',
    selectDistrict: 'Choose a district', searchDistrict: 'Search 64 districts', allClear: 'normal',
    normal: 'Normal', watch: 'Watch', warning: 'Warning', danger: 'Danger', unknown: 'No data',
    riskLevel: 'Risk level', riverContext: 'River outlook · next 16 days', peak: 'Potential peak',
    noPeak: 'No peak date in snapshot', whatNow: 'What to do now', noNumbers: 'Discharge values are not included in this site snapshot.',
    simulated: 'SIMULATION · NOT A REAL FORECAST', drill: 'Run an alert rehearsal', drillHelp: 'Preview a local warning or danger scenario. This changes only this website’s demo view.',
    clearDrill: 'Clear simulation', copyAlert: 'Copy announcement', copied: 'Copied', alertFor: 'COMMUNITY LOUDSPEAKER SCRIPT',
    prepKicker: 'SMALL STEPS, TAKEN EARLY', prepTitle: 'Preparedness, at every stage.', prepBody: 'Clear advice should be useful before water rises and when every minute counts.',
    agentKicker: 'BUILT TO BE USEFUL, NOT JUST CLEVER', agentTitle: 'A companion that speaks your language.', agentBody: 'BonnaSathi combines forecast tools with a language model—but the safety instructions are written and checked by people, then protected in code.',
    flowForecast: 'River forecast', flowForecastSub: 'GloFAS · 16-day discharge outlook',
    flowRules: 'District-aware rules', flowRulesSub: 'Local river thresholds and safeguards',
    flowWords: 'Verified guidance', flowWordsSub: 'Bengali and English · human checked',
    flowPeople: 'Clear next steps', flowPeopleSub: 'For families and community volunteers',
    safetyTitle: 'Safety is part of the system.', safety1: 'Life-safety guidance is written and checked by a native Bengali speaker—not generated by the model.',
    safety2: 'Code checks language and preserves verified guidance if the model changes it.', safety3: 'A forecast is never a promise of safety. Flood conditions can change quickly.',
    proofKicker: 'TESTED AGAINST HISTORY', proofTitle: 'Good at river floods. Honest about the gaps.',
    proofBody: 'The project backtests GloFAS reanalysis from 1995–2024 against river-discharge thresholds and known flood years. This is a retrospective threshold test, not a forecast lead-time or operational warning-performance test.',
    backtestCaveat: 'Historical reanalysis and threshold detection only—not evidence of forecast lead time or operational predictive skill.',
    metricYears: 'major flood years detected in Kurigram and Sirajganj', metricDanger: 'more danger days, on average, in flood years',
    metricSunamganj: 'Sunamganj flood years detected: 1998, 2004, 2007 and 2017',
    limitationTitle: 'What this forecast does not cover', limitationBody: 'River floods only—not cyclone storm surge, urban waterlogging or most flash floods. The global model is 5 km resolution and district points are approximate. It missed the June 2022 Sylhet flash flood.',
    finalTitle: 'Preparedness starts with a clearer picture.', finalBody: 'Explore a district, learn the next steps, and share verified guidance with your community.',
    ctaDistrict: 'Check a district', emergency: 'Emergency in Bangladesh? Call',
    footer: 'BonnaSathi · Flood companion for Bangladesh', footerNote: 'Always follow the Flood Forecasting and Warning Centre and local authorities.',
    simulationNote: 'A preparedness demo. Not an official warning. Follow FFWC and local authorities.',
    countsLabel: 'districts in this sample', mapAlt: 'Interactive map of Bangladesh with a selectable marker for each of its 64 districts',
  },
  bn: {
    navMap: 'জেলার পূর্বাভাস', navPrep: 'প্রস্তুতি নিন', navAbout: 'যেভাবে কাজ করে', navCta: 'ডেমো দেখুন',
    eyebrow: 'বাংলাদেশের বন্যা প্রস্তুতি · বাংলা + ইংরেজি',
    heroLead: 'নদীর পানি বাড়লে,', heroAccent: 'আগে পৌঁছাক স্পষ্ট বার্তা।',
    heroBody: 'পরিবার ও স্থানীয় স্বেচ্ছাসেবকদের জন্য বন্যার সঙ্গী। পূর্বাভাসকে সহজ করণীয়তে বদলে দেয়—মানুষের নিজের ভাষায়।',
    heroPrimary: 'জেলার অবস্থা দেখুন', heroSecondary: 'আপনার বন্যার সঙ্গীকে জানুন',
    heroNote: 'প্রস্তুতির সহায়ক—সরকারি সতর্কবার্তা নয়।',
    sceneLabel: 'বাংলাদেশ · ১৬ দিনের নদীর পূর্বাভাস', sceneCaption: 'নদী আমাদের যুক্ত করে। প্রস্তুতি আমাদের রক্ষা করে।',
    stripA: '৬৪ জেলা', stripB: 'বাংলা + ইংরেজি', stripC: 'যাচাইকৃত নিরাপত্তা নির্দেশনা',
    mapKicker: 'সারা দেশের চিত্র', mapTitle: 'এক দেশ। প্রতিটি জেলা।',
    mapBody: 'একটি জেলা বেছে নিন—পূর্বাভাস ও করণীয় দেখুন। এই ডেমোতে প্রকল্পের সঙ্গে দেওয়া নমুনা পূর্বাভাস ব্যবহার করা হয়েছে, সরাসরি তথ্য নয়।',
    snapshot: 'প্রকল্পের নমুনা', updated: 'তৈরির সময়', latest: 'জেলার অবস্থা',
    selectDistrict: 'জেলা বেছে নিন', searchDistrict: '৬৪ জেলার মধ্যে খুঁজুন', allClear: 'স্বাভাবিক',
    normal: 'স্বাভাবিক', watch: 'নজর রাখুন', warning: 'সতর্কতা', danger: 'বিপদ', unknown: 'তথ্য নেই',
    riskLevel: 'ঝুঁকির মাত্রা', riverContext: 'নদীর পূর্বাভাস · আগামী ১৬ দিন', peak: 'সম্ভাব্য সর্বোচ্চ',
    noPeak: 'নমুনায় তারিখ নেই', whatNow: 'এখন করণীয়', noNumbers: 'এই ওয়েবসাইটের নমুনায় নদীর প্রবাহের সংখ্যাগত তথ্য নেই।',
    simulated: 'পরীক্ষামূলক অনুকরণ · আসল পূর্বাভাস নয়', drill: 'সতর্কতার মহড়া চালান', drillHelp: 'এই ওয়েবসাইটের ডেমোতে সতর্কতা বা বিপদের স্থানীয় উদাহরণ দেখুন। এতে শুধু ডেমো বদলায়।',
    clearDrill: 'অনুকরণ বন্ধ করুন', copyAlert: 'ঘোষণা কপি করুন', copied: 'কপি হয়েছে', alertFor: 'মাইকিং ঘোষণার খসড়া',
    prepKicker: 'আগে থেকে নেওয়া ছোট পদক্ষেপ', prepTitle: 'প্রতিটি ধাপে প্রস্তুতি।', prepBody: 'পানি বাড়ার আগেও, আর সময় কম থাকলেও—পরামর্শ যেন কাজে লাগে।',
    agentKicker: 'শুধু বুদ্ধিমান নয়, কাজে লাগে', agentTitle: 'আপনার ভাষায় কথা বলা সঙ্গী।', agentBody: 'বন্যাসাথী পূর্বাভাসের টুল ও ভাষার মডেল একসঙ্গে ব্যবহার করে। তবে নিরাপত্তার নির্দেশনা মানুষ লেখেন ও যাচাই করেন; কোড সেই লেখা সুরক্ষিত রাখে।',
    flowForecast: 'নদীর পূর্বাভাস', flowForecastSub: 'GloFAS · ১৬ দিনের নদীপ্রবাহ',
    flowRules: 'জেলাভিত্তিক নিয়ম', flowRulesSub: 'স্থানীয় নদীর সীমা ও সুরক্ষাব্যবস্থা',
    flowWords: 'যাচাইকৃত নির্দেশনা', flowWordsSub: 'বাংলা ও ইংরেজি · মানুষ যাচাই করেছেন',
    flowPeople: 'স্পষ্ট করণীয়', flowPeopleSub: 'পরিবার ও স্থানীয় স্বেচ্ছাসেবকদের জন্য',
    safetyTitle: 'নিরাপত্তা ব্যবস্থার অংশ।', safety1: 'জীবনরক্ষার নির্দেশনা বাংলা ভাষাভাষী ব্যক্তি লেখেন ও যাচাই করেন—মডেল তৈরি করে না।',
    safety2: 'কোড ভাষা পরীক্ষা করে এবং মডেল বদলে দিলে যাচাইকৃত নির্দেশনা ফিরিয়ে আনে।', safety3: 'পূর্বাভাস কখনো নিরাপদ থাকার নিশ্চয়তা নয়। বন্যার অবস্থা দ্রুত বদলাতে পারে।',
    proofKicker: 'অতীতের সঙ্গে যাচাই', proofTitle: 'বড় নদীর বন্যায় নির্ভরযোগ্য। সীমাবদ্ধতাও স্পষ্ট।',
    proofBody: 'প্রকল্পটি ১৯৯৫–২০২৪ সালের GloFAS পুনর্বিশ্লেষণকে নদীপ্রবাহের সীমা ও পরিচিত বন্যার বছরের সঙ্গে মিলিয়ে দেখেছে। এটি অতীতের সীমা-শনাক্তকরণ পরীক্ষা—পূর্বাভাস কত আগে এসেছে বা বাস্তব সতর্কবার্তার কার্যকারিতা নয়।',
    backtestCaveat: 'শুধু অতীতের পুনর্বিশ্লেষণ ও সীমা-শনাক্তকরণ পরীক্ষা—পূর্বাভাসের আগাম সময় বা বাস্তব কার্যকারিতার প্রমাণ নয়।',
    metricYears: 'কুড়িগ্রাম ও সিরাজগঞ্জে বড় বন্যার বছর শনাক্ত', metricDanger: 'বন্যার বছরে গড়ে বিপদের দিন বেশি',
    metricSunamganj: 'সুনামগঞ্জে শনাক্ত বন্যার বছর: ১৯৯৮, ২০০৪, ২০০৭ ও ২০১৭',
    limitationTitle: 'এই পূর্বাভাসে যা নেই', limitationBody: 'শুধু নদীর বন্যা—ঘূর্ণিঝড়ের জলোচ্ছ্বাস, শহরের জলাবদ্ধতা বা অধিকাংশ আকস্মিক বন্যা নয়। বৈশ্বিক মডেলের রেজোলিউশন ৫ কিমি, আর জেলার পর্যবেক্ষণ-স্থান আনুমানিক। ২০২২ সালের জুনে সিলেটের আকস্মিক বন্যা ধরা পড়েনি।',
    finalTitle: 'প্রস্তুতি শুরু হয় স্পষ্ট চিত্র থেকে।', finalBody: 'জেলা দেখুন, করণীয় জানুন, যাচাইকৃত নির্দেশনা সবার সঙ্গে ভাগ করুন।',
    ctaDistrict: 'জেলা দেখুন', emergency: 'বাংলাদেশে জরুরি প্রয়োজনে ফোন করুন',
    footer: 'বন্যাসাথী · বাংলাদেশের বন্যার সঙ্গী', footerNote: 'বন্যা পূর্বাভাস ও সতর্কীকরণ কেন্দ্র এবং স্থানীয় প্রশাসনের নির্দেশনা অনুসরণ করুন।',
    simulationNote: 'প্রস্তুতির ডেমো। সরকারি সতর্কবার্তা নয়। বন্যা পূর্বাভাস ও সতর্কীকরণ কেন্দ্র এবং স্থানীয় প্রশাসনের নির্দেশনা অনুসরণ করুন।',
    countsLabel: 'জেলার নমুনা', mapAlt: 'বাংলাদেশের ইন্টারেক্টিভ মানচিত্র—৬৪ জেলার প্রতিটির জন্য বেছে নেওয়ার চিহ্ন রয়েছে',
  },
} as const;
