import { PublicFooter } from '@/components/layout/public-footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { NewsCards } from '@/components/home/news-cards'
import { fetchPublicNews } from '@/lib/api'
import { Newspaper } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const news = await fetchPublicNews()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-10 flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Todas las noticias</h1>
            <p className="mt-2 text-muted-foreground">Novedades, comunicados y anuncios del Centro Vecinal.</p>
          </div>
        </div>
        <NewsCards items={news} />
      </main>
      <PublicFooter />
    </div>
  )
}
