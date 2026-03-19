package ar.com.inaudi.CentroVecinal.controller;

import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.news.NewsResponse;
import ar.com.inaudi.CentroVecinal.dto.news.NewsUpsertRequest;
import ar.com.inaudi.CentroVecinal.security.SecurityUtils;
import ar.com.inaudi.CentroVecinal.service.NewsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping("/api/public/news")
    public List<NewsResponse> getPublishedNews() {
        return newsService.getPublishedNews();
    }

    @GetMapping("/api/public/news/{newsId}")
    public NewsResponse getPublishedNewsDetail(@PathVariable Long newsId) {
        return newsService.getPublishedNewsDetail(newsId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/news")
    public List<NewsResponse> getAdminNews() {
        return newsService.getAdminNews();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/news/{newsId}")
    public NewsResponse getAdminNewsDetail(@PathVariable Long newsId) {
        return newsService.getAdminNewsDetail(newsId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/news")
    public NewsResponse createNews(@Valid @RequestBody NewsUpsertRequest request) {
        return newsService.createNews(request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/news/{newsId}")
    public NewsResponse updateNews(@PathVariable Long newsId, @Valid @RequestBody NewsUpsertRequest request) {
        return newsService.updateNews(newsId, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/news/{newsId}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long newsId) {
        newsService.deleteNews(newsId);
        return ResponseEntity.noContent().build();
    }
}
