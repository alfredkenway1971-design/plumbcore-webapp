import { NextRequest } from 'next/server';

const translations = {
  en: {},
  fr: {},
  es: {},
  de: {},
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  
  if (!['en', 'fr', 'es', 'de'].includes(locale)) {
    return new Response('Invalid locale', { status: 400 });
  }

  return Response.json(translations[locale as keyof typeof translations] || {});
}