package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("TV_SERIES")
@Getter
@Setter
public class TvSeries extends Media {
    
    @OneToMany(mappedBy = "tvSeries", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Season> seasons = new ArrayList<>();

    @Override
    public MediaType getType() {
        return MediaType.TV_SERIES;
    }

    public Season addNewSeason(String title, Integer seasonNumber) {
        int nextSeasonNumber = (seasonNumber != null) ? seasonNumber : (this.seasons.size() + 1);
        
        boolean exists = this.seasons.stream()
                .anyMatch(s -> s.getSeasonNumber().equals(nextSeasonNumber));
        if (exists) {
            throw new IllegalStateException("Season number " + nextSeasonNumber + " already exists!");
        }
        
        Season season = new Season();
        season.setTvSeries(this);
        season.setTitle(title);
        season.setSeasonNumber(nextSeasonNumber);
        this.seasons.add(season);
        return season;
    }
}
