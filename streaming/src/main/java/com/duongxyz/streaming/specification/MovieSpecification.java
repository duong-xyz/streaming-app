package com.duongxyz.streaming.specification;

import com.duongxyz.streaming.entity.Movies;
import com.duongxyz.streaming.form.MovieFilterForm;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;

public class MovieSpecification {
    public static Specification<Movies> buildSpec(MovieFilterForm form) {
        return form == null ? null : new Specification<Movies>() {
            @Override
            public @Nullable Predicate toPredicate(
                    Root<Movies> root,
                    CriteriaQuery<?> query,
                    CriteriaBuilder criteriaBuilder) {
                ArrayList<Predicate> predicates = new ArrayList<>();
                String search = form.getSearch();
                if (search != null) {
                    Predicate predicate = criteriaBuilder.like(root.get("title"), "%" + search + "%");
                    predicates.add(predicate);
                }

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            }
        };
    }
}
