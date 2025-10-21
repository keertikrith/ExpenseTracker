import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'hi', 'kn'];

export default getRequestConfig(async ({locale}) => {
  // Always default to 'en' if locale is undefined or not supported
  const validLocale = locale && locales.includes(locale) ? locale : 'en';
  
  console.log(`Loading messages for locale: ${validLocale}`);
  
  try {
    const messages = (await import(`../public/messages/${validLocale}.json`)).default;
    console.log(`Successfully loaded messages for ${validLocale}`);
    return {
      messages,
      locale: validLocale,
      timeZone: 'Asia/Kolkata'
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${validLocale}:`, error);
    // Fallback to English if locale messages fail to load
    const fallbackMessages = (await import(`../public/messages/en.json`)).default;
    return {
      messages: fallbackMessages,
      locale: 'en',
      timeZone: 'Asia/Kolkata'
    };
  }
});

