import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NewsItem } from '@/lib/types'
import { Calendar } from 'lucide-react'

type NewsCardsProps = {
  items: NewsItem[]
}

export function NewsCards({ items }: NewsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((news) => (
        <Link key={news.id} href={`/noticias/${news.id}`} className="block h-full">
          <Card className="flex h-full flex-col bg-card border-border transition-colors hover:border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
                {news.title}
              </CardTitle>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(news.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{news.copete}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
