import { cookies } from 'next/headers';
import { dictionaries, Locale } from './dictionaries';

export async function getDictionary() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = (localeCookie?.value === 'th' ? 'th' : 'en') as Locale;
  
  return {
    dict: dictionaries[locale],
    locale
  };
}
