package ar.com.inaudi.CentroVecinal.modules.contenido.service;

import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.contenido.dto.news.NewsResponse;
import ar.com.inaudi.CentroVecinal.modules.contenido.dto.news.NewsUpsertRequest;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.modules.contenido.mapper.NewsMapper;
import ar.com.inaudi.CentroVecinal.modules.contenido.model.News;
import ar.com.inaudi.CentroVecinal.modules.contenido.repository.NewsRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NewsService {

    private final NewsRepository newsRepository;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> getPublishedNews() {
        return newsRepository.findByPublishedTrueOrderByCreatedAtDesc()
                .stream()
                .map(NewsMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NewsResponse getPublishedNewsDetail(Long newsId) {
        return NewsMapper.toResponse(newsRepository.findByIdAndPublishedTrue(newsId)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia no encontrada")));
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> getAdminNews() {
        return newsRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(NewsMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NewsResponse getAdminNewsDetail(Long newsId) {
        return NewsMapper.toResponse(findExistingNews(newsId));
    }

    @Transactional
    public NewsResponse createNews(NewsUpsertRequest request, CurrentUser currentUser) {
        LocalDateTime now = LocalDateTime.now();

        News news = new News();
        news.setTitle(request.getTitle().trim());
        news.setContent(request.getContent().trim());
        news.setCopete(request.getCopete().trim());
        news.setImageUrl(normalizeOptional(request.getImageUrl()));
        news.setPublished(request.getPublished());
        news.setAuthorId(currentUser.userId());
        news.setAuthorUsername(currentUser.username());
        news.setCreatedAt(now);
        news.setUpdatedAt(now);

        return NewsMapper.toResponse(newsRepository.save(news));
    }

    @Transactional
    public NewsResponse updateNews(Long newsId, NewsUpsertRequest request) {
        News news = findExistingNews(newsId);

        news.setTitle(request.getTitle().trim());
        news.setContent(request.getContent().trim());
        news.setCopete(request.getCopete().trim());
        news.setImageUrl(normalizeOptional(request.getImageUrl()));
        news.setPublished(request.getPublished());
        news.setUpdatedAt(LocalDateTime.now());

        return NewsMapper.toResponse(newsRepository.save(news));
    }

    @Transactional
    public void deleteNews(Long newsId) {
        News news = findExistingNews(newsId);
        newsRepository.delete(news);
    }

    private News findExistingNews(Long newsId) {
        return newsRepository.findById(newsId)
                .orElseThrow(() -> new ResourceNotFoundException("Noticia no encontrada"));
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
