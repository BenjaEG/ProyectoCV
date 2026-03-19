import { PublicNavbar } from '@/components/layout/public-navbar'
import { PublicFooter } from '@/components/layout/public-footer'
import { HeroSection } from '@/components/home/hero-section'
import { NewsSection } from '@/components/home/news-section'
import { EventsSection } from '@/components/home/events-section'
import { ContactSection } from '@/components/home/contact-section'
import { fetchPublicEvents, fetchPublicNews } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [news, events] = await Promise.all([fetchPublicNews(), fetchPublicEvents()])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <NewsSection items={news.slice(0, 3)} />
        <EventsSection items={events.slice(0, 3)} />
        <ContactSection />
      </main>
      <PublicFooter />
    </div>
  )
}
