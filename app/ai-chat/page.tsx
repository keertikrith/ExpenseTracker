import AIChat from '@/components/AIChat';
import { currentUser } from '@clerk/nextjs/server';
import Guest from '@/components/Guest';

export default async function AIChatPage() {
  const user = await currentUser();
  if (!user) {
    return <Guest />;
  }

  return (
    <main className='bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans min-h-screen transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-6 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4'>
              AI Financial Assistant
            </h1>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              Get personalized financial advice, budget planning, investment guidance, and more from our AI-powered assistant.
            </p>
          </div>
          <AIChat />
        </div>
      </div>
    </main>
  );
}

