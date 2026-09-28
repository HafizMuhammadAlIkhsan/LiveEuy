package com.liveeuy.catalog_service.repository;

import com.liveeuy.catalog_service.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, String>, JpaSpecificationExecutor<Media> {

    List<Media> findAllByIdIn(List<String> ids);

}
