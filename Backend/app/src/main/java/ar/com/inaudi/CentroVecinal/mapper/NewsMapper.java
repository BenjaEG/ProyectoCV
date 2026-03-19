package ar.com.inaudi.CentroVecinal.mapper;

import ar.com.inaudi.CentroVecinal.dto.news.NewsResponse;
import ar.com.inaudi.CentroVecinal.model.News;

public final class NewsMapper {

    private NewsMapper() {
    }

    public static NewsResponse toResponse(News news) {
        return NewsResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .copete(news.getCopete())
                .content(news.getContent())
                .imageUrl(news.getImageUrl())
                .published(news.getPublished())
                .authorId(news.getAuthorId())
                .authorUsername(news.getAuthorUsername())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .build();
    }
}
