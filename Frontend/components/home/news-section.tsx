import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NewsCards } from '@/components/home/news-cards'
import type { NewsItem } from '@/lib/types'
import { Newspaper } from 'lucide-react'

type NewsSectionProps = {
  items: NewsItem[]
}

export function NewsSection({ items }: NewsSectionProps) {
  return (
    <section id="noticias" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Noticias</h2>
          </div>
          <Link href="/noticias">
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>

        <NewsCards items={items} />
      </div>
    </section>
  )
}
