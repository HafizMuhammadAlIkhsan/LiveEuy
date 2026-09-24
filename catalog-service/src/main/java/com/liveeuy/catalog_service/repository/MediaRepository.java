package com.liveeuy.catalog_service.repository;

import com.liveeuy.catalog_service.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, String> {
    List<Media> findByTypeIgnoreCase(String type);

    List<Media> findByTitleContainingIgnoreCase(String title);

    List<Media> findByIsTrendingTrue();

    List<Media> findByIsFeaturedTrue();

    List<Media> findByTopRankIsNotNullOrderByTopRankAsc();
}
