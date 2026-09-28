package com.liveeuy.catalog_service.specification;

import com.liveeuy.catalog_service.entity.Media;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class MediaSpecification {
    private static final String TYPE_ALL = "all";
    private static final String GENRE_ALL = "Semua Genre";

public static Specification<Media> buildFilter(String type, String genre, String search) {
        return (root, query, criteriaBuilder) -> {
            
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            if (StringUtils.hasText(search)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(type) && !type.equalsIgnoreCase(TYPE_ALL)) {
                try {
                    com.liveeuy.catalog_service.entity.enums.MediaType typeEnum = 
                            com.liveeuy.catalog_service.entity.enums.MediaType.valueOf(type.toUpperCase());
                    
                    predicates.add(criteriaBuilder.equal(root.get("type"), typeEnum));
                } catch (IllegalArgumentException e) {
                    
                }
            }

            if (StringUtils.hasText(genre) && !genre.equalsIgnoreCase(GENRE_ALL)) {
                Join<Media, String> genresJoin = root.join("genres");
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(genresJoin), genre.toLowerCase()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
