package com.liveeuy.catalog_service.repository;

import com.liveeuy.catalog_service.entity.Episode;  
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, String> {
}