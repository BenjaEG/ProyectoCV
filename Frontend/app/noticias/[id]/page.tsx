import { notFound } from 'next/navigation'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPublicNewsDetail } from '@/lib/api'
import { Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

type NewsDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params

  try {
    const news = await fetchPublicNewsDetail(id)

    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <PublicNavbar />
        <main className="container mx-auto flex-1 px-4 py-16">
          <Card className="mx-auto max-w-4xl border-border bg-card">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(news.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">{news.title}</CardTitle>
              <p className="text-lg leading-relaxed text-muted-foreground">{news.copete}</p>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-[15px] leading-8 text-foreground/95">{news.content}</div>
            </CardContent>
          </Card>
        </main>
        <PublicFooter />
      </div>
    )
  } catch {
    notFound()
  }
}
