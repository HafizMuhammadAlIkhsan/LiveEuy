package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("MOVIE")
@Getter
@Setter
public class Movie extends Media {

    private Integer durationSeconds;
    private String videoUrl;

    @Enumerated(EnumType.STRING)
    private VideoQuality quality;

    private String audio;

    @Override
    public MediaType getType() {
        return MediaType.MOVIE;
    }
}
