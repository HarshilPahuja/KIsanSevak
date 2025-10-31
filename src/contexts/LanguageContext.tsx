import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translations = getTranslations(language);
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // App name and common
    'app.name': 'kisaanSevak',
    'common.hello': 'Hello',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.refresh': 'Refresh',
    'common.check.eligibility': 'Check Eligibility',
    'common.apply.now': 'Apply Now',
    'common.no.active.alerts': 'No Active Alerts',
    'common.no.active.alerts.desc': 'All clear! No weather or farming alerts at the moment. Check back later or refresh to get the latest updates.',
    'common.unable.load.alerts': 'Unable to Load Alerts',
    'common.recent.schemes': 'Recent Schemes',
    
    // Navigation
    'nav.home': 'Home',
    'nav.alerts': 'Alerts',
    'nav.schemes': 'Schemes',
    'nav.metrics': 'Metrics',
    'nav.chat': 'Chat',
    'nav.crops': 'Crops',
    
    // Home screen
    'home.greeting': 'Hello',
    'home.subtitle': 'नमस्कार शेतकरी मित्र',
    'home.weather.alerts': 'Weather Alerts',
    'home.no.alerts': 'All clear! No weather alerts at the moment.',
    'home.market.prices': 'Market Prices',
    'home.weather.report': 'Weather Report',
    
    // Weather alerts
    'alerts.high.temp': 'High Temperature Warning',
    'alerts.high.temp.desc': 'Extreme heat expected. Protect your crops from heat stress.',
    'alerts.heavy.rain': 'Heavy Rain Alert',
    'alerts.heavy.rain.desc': 'Heavy rainfall expected. Ensure proper drainage for your fields.',
    'alerts.drought': 'Drought Warning',
    'alerts.drought.desc': 'Low rainfall predicted. Consider water conservation measures.',
    'alerts.frost': 'Frost Alert',
    'alerts.frost.desc': 'Frost conditions expected. Protect sensitive crops.',
    'alerts.severity.urgent': 'URGENT',
    'alerts.severity.warning': 'WARNING',
    'alerts.severity.info': 'INFO',
    
    // Schemes
    'schemes.title': 'Government Schemes',
    'schemes.subtitle': 'Available agricultural schemes and benefits',
    'schemes.pm.kisan': 'PM-KISAN Samman Nidhi',
    'schemes.pm.kisan.desc': 'Direct income support of ₹6000 per year to farmer families',
    'schemes.pm.kisan.apply': 'Apply Now',
    'schemes.rythu.bandhu': 'Rythu Bandhu Scheme',
    'schemes.rythu.bandhu.desc': 'Income support to farmers for their agricultural and horticultural needs',
    'schemes.crop.insurance': 'Pradhan Mantri Fasal Bima Yojana',
    'schemes.crop.insurance.desc': 'Comprehensive crop insurance coverage',
    'schemes.launched.in': 'Launched in',
    'schemes.soil.health': 'Soil Health Card Scheme',
    'schemes.soil.health.desc': 'Get your soil tested for free and receive recommendations',
    
    // Metrics
    'metrics.title': 'Farm Metrics',
    'metrics.subtitle': 'Track your farm performance and analytics',
    'metrics.crop.yield': 'Crop Yield',
    'metrics.profit.loss': 'Profit & Loss',
    'metrics.expenses': 'Expenses',
    'metrics.revenue': 'Revenue',
    'metrics.monthly.summary': 'Monthly Summary',
    'metrics.error.loading': 'Error Loading Metrics',
    'metrics.no.crops': 'No Crops Found',
    'metrics.no.crops.desc': 'Add some crops in the Crop Details section to see yield predictions and metrics.',
    'metrics.total.active.crops': 'Total Active Crops',
    'metrics.total.area': 'Total Area',
    'metrics.yield.predictions': 'Yield Predictions',
    'metrics.yield.predictions.desc': 'AI-powered predictions based on area, weather, and investment',
    'metrics.confidence': 'confidence',
    'metrics.total.expected.yield': 'Total expected yield from all crops',
    'metrics.financial.analysis': 'Financial Analysis',
    'metrics.investment.vs.returns': 'Investment vs projected returns',
    'metrics.projected.revenue': 'Projected Revenue',
    'metrics.total.investment': 'Total Investment',
    'metrics.projected.profit': 'Projected Profit',
    'metrics.crop.breakdown': 'Crop Breakdown',
    
    // Chat
    'chat.title': 'AI Assistant',
    'chat.subtitle': 'Get farming advice and answers to your questions',
    'chat.placeholder': 'Type your message in any language...',
    'chat.send': 'Send',
    'chat.ai.thinking': 'AI is thinking...',
    'chat.voice.failed': 'Voice input failed',
    'chat.voice.try.again': 'Please try again',
    'chat.voice.not.supported': 'Voice input not supported',
    'chat.voice.browser.not.support': "Your browser doesn't support voice input",
    'chat.ai.error': 'AI Error',
    'chat.ai.error.desc': 'Failed to get response from AI assistant. Please try again.',
    'chat.ai.trouble': "Sorry, I'm having trouble responding right now. Please try again later.",
    'chat.welcome': "Hello, farmer! I'm your farming helper. You can ask me about crop problems, pests, plant diseases, fertilizers, or weather tips. You can also send a photo, and I'll try to tell you what's wrong with your plants. How can I help you today?",
    
    // Crops
    'crops.title': 'My Crops',
    'crops.subtitle': 'Manage your crop information and get recommendations',
    'crops.add.new': 'Add New Crop',
    'crops.suggestions': 'Crop Suggestions',
    'crops.profile': 'Farmer Profile',
    'crops.name': 'Name',
    'crops.location': 'Location',
    'crops.experience': 'Experience',
    'crops.land.size': 'Land Size',
    'crops.form.title': 'Crop Details',
    'crops.form.farmer.name': 'Farmer Name',
    'crops.form.farmer.name.placeholder': 'Enter your name',
    'crops.form.crop.type': 'Crop Type',
    'crops.form.crop.type.placeholder': 'e.g., Rice, Wheat, Tomato',
    'crops.form.variety': 'Variety (Optional)',
    'crops.form.variety.placeholder': 'e.g., Basmati, IR64',
    'crops.form.additional.details': 'Additional Details',
    'crops.form.additional.details.placeholder': 'Enter farming methods, soil type, irrigation, etc.',
    'crops.form.location.name': 'Location Name',
    'crops.form.location.name.placeholder': 'Village, District, State',
    'crops.form.gps.coordinates': 'GPS Coordinates',
    'crops.form.gps.placeholder': 'Click GPS button to auto-fill',
    'crops.form.gps.help': 'GPS location helps with accurate area detection and weather analysis',
    'crops.form.estimated.area': 'Estimated Farm Area (sq. meters)',
    'crops.form.estimated.area.placeholder': 'Enter approximate area',
    'crops.form.area.help': 'This helps improve AI area detection accuracy',
    'crops.form.ai.area.detection': 'AI Area Detection',
    'crops.form.ai.area.description': 'Use satellite imagery to detect crop area automatically',
    'crops.form.detecting': 'Detected',
    'crops.form.analyzing': 'Analyzing Satellite Image...',
    'crops.form.detect.satellite': 'Detect Area from Satellite',
    'crops.form.gps.required': 'Set GPS location first to enable satellite area detection',
    'crops.form.detected.area': 'Detected Area:',
    'crops.form.confidence': 'Confidence:',
    'crops.form.view.satellite': 'View Satellite Image',
    'crops.form.investment': 'Investment Amount (₹)',
    'crops.form.investment.placeholder': 'Total money invested',
    'crops.form.investment.help': 'Include seeds, fertilizers, labor, equipment, etc.',
    'crops.form.saving': 'Saving Crop Data...',
    'crops.form.save': 'Save Crop Details',
    'crops.form.location.captured': 'Location captured',
    'crops.form.location.captured.desc': 'Your current location has been added',
    'crops.form.location.error': 'Location error',
    'crops.form.location.error.desc': 'Could not get your location',
    'crops.form.location.required': 'Location required',
    'crops.form.location.required.desc': 'Please set your location before detecting area from satellite',
    'crops.form.mapbox.error': 'Mapbox not configured',
    'crops.form.mapbox.error.desc': 'Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file',
    'crops.form.area.detected': 'Area detected successfully',
    'crops.form.area.failed': 'Area detection failed',
    'crops.form.area.failed.desc': 'Could not detect area from satellite',
    'crops.form.crop.saved': 'Crop information saved',
    'crops.form.crop.saved.desc': 'Your farm details have been saved successfully.',
    'crops.form.save.failed': 'Save failed',
    'crops.form.save.failed.desc': 'Could not save crop information',
    
    // Weather
    'weather.temperature': 'Temperature',
    'weather.humidity': 'Humidity',
    'weather.rainfall': 'Rainfall',
    'weather.wind': 'Wind Speed',
    'weather.today': 'Today',
    'weather.forecast': '7-Day Forecast',
    
    // Market prices
    'market.rice': 'Rice',
    'market.wheat': 'Wheat',
    'market.tomato': 'Tomato',
    'market.onion': 'Onion',
    'market.potato': 'Potato',
    'market.maize': 'Maize',
    'market.green.gram': 'Green Gram',
    'market.black.gram': 'Black Gram',
    'market.gram': 'Gram',
    'market.soybean': 'Soybean',
    'market.groundnut': 'Groundnut',
    'market.turmeric': 'Turmeric',
    'market.chili': 'Chili (Dry)',
    'market.coriander': 'Coriander',
    'market.cabbage': 'Cabbage',
    'market.cauliflower': 'Cauliflower',
    'market.brinjal': 'Brinjal',
    'market.okra': 'Okra',
    'market.green.peas': 'Green Peas',
    'market.other': 'Other Crop',
    'market.per.quintal': 'per quintal',
    'market.trending.up': 'Trending Up',
    'market.trending.down': 'Trending Down',
    'market.stable': 'Stable'
  },
  
  mr: {
    // App name and common
    'app.name': 'किसानसेवक',
    'common.hello': 'नमस्कार',
    'common.back': 'परत',
    'common.loading': 'लोड होत आहे...',
    'common.error': 'त्रुटी',
    'common.success': 'यशस्वी',
    'common.submit': 'सबमिट करा',
    'common.cancel': 'रद्द करा',
    'common.save': 'सेव्ह करा',
    'common.edit': 'संपादन',
    'common.delete': 'हटवा',
    'common.refresh': 'रिफ्रेश',
    'common.check.eligibility': 'पात्रता तपासा',
    'common.apply.now': 'आता अर्ज करा',
    'common.no.active.alerts': 'कोणतेही सक्रिय अलर्ट नाहीत',
    'common.no.active.alerts.desc': 'सर्व काही ठीक आहे! सध्या कोणतेही हवामान किंवा शेती अलर्ट नाहीत. नंतर तपासा किंवा नवीनतम अपडेट मिळवण्यासाठी रिफ्रेश करा.',
    'common.unable.load.alerts': 'अलर्ट लोड करू शकत नाही',
    'common.recent.schemes': 'अलीकडील योजना',
    
    // Navigation
    'nav.home': 'होम',
    'nav.alerts': 'अलर्ट',
    'nav.schemes': 'योजना',
    'nav.metrics': 'मेट्रिक्स',
    'nav.chat': 'चॅट',
    'nav.crops': 'पीक',
    
    // Home screen
    'home.greeting': 'नमस्कार',
    'home.subtitle': 'नमस्कार शेतकरी मित्र',
    'home.weather.alerts': 'हवामान अलर्ट',
    'home.no.alerts': 'सर्व काही ठीक आहे! सध्या कोणतेही हवामान अलर्ट नाहीत.',
    'home.market.prices': 'बाजार भाव',
    'home.weather.report': 'हवामान अहवाल',
    
    // Weather alerts
    'alerts.high.temp': 'उच्च तापमान चेतावणी',
    'alerts.high.temp.desc': 'अतिशय उष्णता अपेक्षित. आपल्या पिकांना उष्णतेच्या तणावापासून संरक्षण द्या.',
    'alerts.heavy.rain': 'मुसळधार पाऊस अलर्ट',
    'alerts.heavy.rain.desc': 'मुसळधार पाऊस अपेक्षित. आपल्या शेतात योग्य निचरा सुनिश्चित करा.',
    'alerts.drought': 'दुष्काळ चेतावणी',
    'alerts.drought.desc': 'कमी पाऊस अपेक्षित. पाणी संधारण उपायांचा विचार करा.',
    'alerts.frost': 'हिमकण अलर्ट',
    'alerts.frost.desc': 'हिमकण परिस्थिती अपेक्षित. संवेदनशील पिकांचे संरक्षण करा.',
    'alerts.severity.urgent': 'तात्काळ',
    'alerts.severity.warning': 'चेतावणी',
    'alerts.severity.info': 'माहिती',
    
    // Schemes
    'schemes.title': 'सरकारी योजना',
    'schemes.subtitle': 'उपलब्ध कृषी योजना आणि फायदे',
    'schemes.pm.kisan': 'पंतप्रधान किसान सन्मान निधी',
    'schemes.pm.kisan.desc': 'शेतकरी कुटुंबांना दरवर्षी ₹६००० थेट आयात समर्थन',
    'schemes.pm.kisan.apply': 'आता अर्ज करा',
    'schemes.rythu.bandhu': 'रायथू बंधू योजना',
    'schemes.rythu.bandhu.desc': 'कृषी व बागायती गरजांसाठी शेतकऱ्यांना उत्पन्न सहाय्य',
    'schemes.crop.insurance': 'प्रधानमंत्री फसल बीमा योजना',
    'schemes.crop.insurance.desc': 'सर्वसमावेशक पीक विमा कव्हरेज',
    'schemes.launched.in': 'मध्ये सुरू झाली',
    'schemes.soil.health': 'मृदा आरोग्य कार्ड योजना',
    'schemes.soil.health.desc': 'आपली मिट्टी मोफत तपासा आणि शिफारशी मिळवा',
    
    // Metrics
    'metrics.title': 'शेत मेट्रिक्स',
    'metrics.subtitle': 'आपल्या शेताची कामगिरी आणि विश्लेषण ट्रॅक करा',
    'metrics.crop.yield': 'पीक उत्पादन',
    'metrics.profit.loss': 'नफा आणि तोटा',
    'metrics.expenses': 'खर्च',
    'metrics.revenue': 'महसूल',
    'metrics.monthly.summary': 'मासिक सारांश',
    'metrics.error.loading': 'मेट्रिक्स लोड करण्यात त्रुटी',
    'metrics.no.crops': 'कोणतीही पिके सापडली नाहीत',
    'metrics.no.crops.desc': 'उत्पादन अंदाज आणि मेट्रिक्स पाहण्यासाठी पिक तपशील भागात काही पिके जोडा.',
    'metrics.total.active.crops': 'सक्रिय पिके कूल',
    'metrics.total.area': 'कूल क्षेत्र',
    'metrics.yield.predictions': 'उत्पादन अंदाज',
    'metrics.yield.predictions.desc': 'क्षेत्र, हवामान आणि गुंतवणूकीवर आधारित एआय-चालित अंदाज',
    'metrics.confidence': 'आत्मविश्वास',
    'metrics.total.expected.yield': 'सर्व पिकांपासून अपेक्षित कूल उत्पादन',
    'metrics.financial.analysis': 'आर्थिक विश्लेषण',
    'metrics.investment.vs.returns': 'गुंतवणूक विरुद्ध अपेक्षित परतावा',
    'metrics.projected.revenue': 'अपेक्षित महसूल',
    'metrics.total.investment': 'कूल गुंतवणूक',
    'metrics.projected.profit': 'अपेक्षित नफा',
    'metrics.crop.breakdown': 'पिक प्रभागीकरण',
    
    // Chat
    'chat.title': 'एआय सहाय्यक',
    'chat.subtitle': 'शेतीबाबत सल्ला आणि आपल्या प्रश्नांची उत्तरे मिळवा',
    'chat.placeholder': 'कोणत्याही भाषेत आपला संदेश टाइप करा...',
    'chat.send': 'पाठवा',
    'chat.ai.thinking': 'एआय विचार करत आहे...',
    'chat.voice.failed': 'व्हॉइस इनपुट अयशस्वी',
    'chat.voice.try.again': 'कृपया पुन्हा प्रयत्न करा',
    'chat.voice.not.supported': 'व्हॉइस इनपुट समर्थित नाही',
    'chat.voice.browser.not.support': 'आपला ब्राउझर व्हॉइस इनपुट समर्थित करत नाही',
    'chat.ai.error': 'एआय त्रुटी',
    'chat.ai.error.desc': 'एआय आसिस्टंटपासून प्रतिसाद मिळवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    'chat.ai.trouble': 'माफ करा, मला आत्ता प्रतिसाद देण्यात अडचण येत आहे. कृपया नंतर पुन्हा प्रयत्न करा.',
    'chat.welcome': 'नमस्कार, शेतकरी! मी तुमचा शेती सहाय्यक आहे. तुम्ही मला पिकांच्या समस्या, कीड, वनस्पतींचे आजार, खते, किंवा हवामानाच्या टिप्सबद्दल विचारू शकता. तुम्ही फोटोही पाठवू शकता, आणि मी तुम्हाला तुमच्या वनस्पतींच्या काय समस्या आहे ते सांगू प्रयत्न करेन. मी तुम्हाला आज कसी मदत करू शकतो?',
    
    // Crops
    'crops.title': 'माझी पिके',
    'crops.subtitle': 'आपली पीक माहिती व्यवस्थापित करा आणि शिफारशी मिळवा',
    'crops.add.new': 'नवीन पीक जोडा',
    'crops.suggestions': 'पीक सूचना',
    'crops.profile': 'शेतकरी प्रोफाइल',
    'crops.name': 'नाव',
    'crops.location': 'स्थान',
    'crops.experience': 'अनुभव',
    'crops.land.size': 'जमिनीचा आकार',
    'crops.form.title': 'पिकांचे तपशील',
    'crops.form.farmer.name': 'शेतकरीचे नाव',
    'crops.form.farmer.name.placeholder': 'आपले नाव लिहा',
    'crops.form.crop.type': 'पिकाचा प्रकार',
    'crops.form.crop.type.placeholder': 'उदा., भात, गहू, टोमॅटो',
    'crops.form.variety': 'जात (ऐच्छिक)',
    'crops.form.variety.placeholder': 'उदा., बासमती, आयआर६४',
    'crops.form.additional.details': 'अतिरिक्त तपशील',
    'crops.form.additional.details.placeholder': 'शेती पद्धती, मातीचा प्रकार, सिंचन, इ. बद्दल माहिती टाका',
    'crops.form.location.name': 'स्थानाचे नाव',
    'crops.form.location.name.placeholder': 'गाव, जिल्हा, राज्य',
    'crops.form.gps.coordinates': 'जीपीएस निर्देशांक',
    'crops.form.gps.placeholder': 'ऑटो-फिल करण्यासाठी जीपीएस बटन दाबा',
    'crops.form.gps.help': 'जीपीएस स्थान अचूक क्षेत्र शोध आणि हवामान विश्लेषणात मदत करते',
    'crops.form.estimated.area': 'अंदाजित शेताचे क्षेत्र (चौ. मीटर)',
    'crops.form.estimated.area.placeholder': 'अंदाजित क्षेत्र लिहा',
    'crops.form.area.help': 'हे एआय क्षेत्र शोध अचूकता सुधारण्यात मदत करते',
    'crops.form.ai.area.detection': 'एआय क्षेत्र शोध',
    'crops.form.ai.area.description': 'आपोआप किरण क्षेत्र शोधण्यासाठी उपग्रह प्रतिमांचा वापर करा',
    'crops.form.detecting': 'शोधले',
    'crops.form.analyzing': 'उपग्रह प्रतिमाचे विश्लेषण...',
    'crops.form.detect.satellite': 'उपग्रहावरून क्षेत्र शोधा',
    'crops.form.gps.required': 'उपग्रह क्षेत्र शोध सुरू करण्यापूर्वी पहिले जीपीएस स्थान सेट करा',
    'crops.form.detected.area': 'शोधलेले क्षेत्र:',
    'crops.form.confidence': 'आत्मविश्वास:',
    'crops.form.view.satellite': 'उपग्रह प्रतिमा पहा',
    'crops.form.investment': 'गुंतवणूक (₹)',
    'crops.form.investment.placeholder': 'कूल गुंतवणूक',
    'crops.form.investment.help': 'बीज, खते, मजूर, उपकरणे, इ. सामिल करा',
    'crops.form.saving': 'पिक डेटा सेव्ह करत आहे...',
    'crops.form.save': 'पिकांचे तपशील सेव्ह करा',
    'crops.form.location.captured': 'स्थान कैप्चर केले',
    'crops.form.location.captured.desc': 'आपले सद्यस्थिति स्थान जोडले गेले',
    'crops.form.location.error': 'स्थान त्रुटी',
    'crops.form.location.error.desc': 'आपले स्थान मिळू शकले नाही',
    'crops.form.location.required': 'स्थान आवश्यक',
    'crops.form.location.required.desc': 'उपग्रहावरून क्षेत्र शोधण्यापूर्वी कृपया आपले स्थान सेट करा',
    'crops.form.mapbox.error': 'मॅपबॉक्स कॉन्फिगर केले नाही',
    'crops.form.mapbox.error.desc': 'कृपया आपल्या .env फाइलमध्ये VITE_MAPBOX_ACCESS_TOKEN जोडा',
    'crops.form.area.detected': 'क्षेत्र यशस्वीरीत्या शोधले',
    'crops.form.area.failed': 'क्षेत्र शोध अयशस्वी',
    'crops.form.area.failed.desc': 'उपग्रहावरून क्षेत्र शोधू शकले नाही',
    'crops.form.crop.saved': 'पिकांची माहिती सेव्ह केली',
    'crops.form.crop.saved.desc': 'आपले शेताचे तपशील यशस्वीरीत्या सेव्ह केले गेले.',
    'crops.form.save.failed': 'सेव्ह अयशस्वी',
    'crops.form.save.failed.desc': 'पिकांची माहिती सेव्ह करू शकलो नाही',
    
    // Weather
    'weather.temperature': 'तापमान',
    'weather.humidity': 'आर्द्रता',
    'weather.rainfall': 'पाऊस',
    'weather.wind': 'वारा वेग',
    'weather.today': 'आज',
    'weather.forecast': '७-दिवसांचा अंदाज',
    
    // Market prices
    'market.rice': 'तांदूळ',
    'market.wheat': 'गहू',
    'market.tomato': 'टोमॅटो',
    'market.onion': 'कांदा',
    'market.potato': 'बटाटा',
    'market.maize': 'मका',
    'market.green.gram': 'मूग',
    'market.black.gram': 'उडद',
    'market.gram': 'हरभरा',
    'market.soybean': 'सोयाबीन',
    'market.groundnut': 'भूइमूग',
    'market.turmeric': 'हळद',
    'market.chili': 'मिरची (कोरडी)',
    'market.coriander': 'धनिया',
    'market.cabbage': 'कोबी',
    'market.cauliflower': 'फुलकोबी',
    'market.brinjal': 'वांगी',
    'market.okra': 'भेंडी',
    'market.green.peas': 'हिरवा वाटाणा',
    'market.other': 'इतर पीक',
    'market.per.quintal': 'प्रति क्विंटल',
    'market.trending.up': 'वाढत्या प्रवृत्तीत',
    'market.trending.down': 'घटत्या प्रवृत्तीत',
    'market.stable': 'स्थिर'
  }
};

const getTranslations = (language: Language) => {
  return translations[language];
};