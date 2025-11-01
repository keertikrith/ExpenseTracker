import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google/generative-ai'],
  // Force cache refresh
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  }
};

export default withNextIntl(nextConfig);
