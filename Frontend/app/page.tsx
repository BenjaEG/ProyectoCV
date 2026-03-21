import { PublicNavbar } from '@/components/layout/public-navbar'
import { PublicFooter } from '@/components/layout/public-footer'
import { HeroSection } from '@/components/home/hero-section'
import { NewsSection } from '@/components/home/news-section'
import { EventsSection } from '@/components/home/events-section'
import { ContactSection } from '@/components/home/contact-section'
import { fetchPublicEvents, fetchPublicInstitutionSettings, fetchPublicNews } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [news, events, institutionSettings] = await Promise.all([
    fetchPublicNews(),
    fetchPublicEvents(),
    fetchPublicInstitutionSettings(),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar centerName={institutionSettings.nombreCentroVecinal} />
      <main className="flex-1">
        <HeroSection
          centerName={institutionSettings.nombreCentroVecinal}
          description={institutionSettings.descripcionHome}
        />
        <NewsSection items={news.slice(0, 3)} />
        <EventsSection items={events.slice(0, 3)} />
        <ContactSection settings={institutionSettings} />
      </main>
      <PublicFooter centerName={institutionSettings.nombreCentroVecinal} />
    </div>
  )
}
