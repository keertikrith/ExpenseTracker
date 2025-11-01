import FinancialNews from '@/components/FinancialNews';
import { currentUser } from '@clerk/nextjs/server';
import Guest from '@/components/Guest';

import { getTranslations } from 'next-intl/server';

export default async function NewsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const user = await currentUser();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  
  if (!user) {
    return <Guest />;
  }

  return (
    <main className='bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans min-h-screen transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-6 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4'>
              {t('title')}
            </h1>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              {t('subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-6'>
            <FinancialNews />
          </div>
        </div>
      </div>
    </main>
  );
}


