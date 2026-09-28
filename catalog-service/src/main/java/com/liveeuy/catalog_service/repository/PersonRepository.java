package com.liveeuy.catalog_service.repository;

import com.liveeuy.catalog_service.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {
    Optional<Person> findByNameIgnoreCase(String name);
}