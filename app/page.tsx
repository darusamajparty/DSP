import HomePage from "../components/home-page";
import { defaultLocale } from "../lib/i18n/locales";
import { getMessages } from "../lib/i18n/messages";

export default function Home() {
  return <HomePage locale={defaultLocale} messages={getMessages(defaultLocale)} />;
}
