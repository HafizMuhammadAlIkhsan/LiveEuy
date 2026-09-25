package com.liveeuy.catalog_service.repository;

import com.liveeuy.catalog_service.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeasonRepository extends JpaRepository<Season, String> {
}