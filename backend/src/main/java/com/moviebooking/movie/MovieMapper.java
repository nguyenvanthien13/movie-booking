package com.moviebooking.movie;

public final class MovieMapper {
    private MovieMapper() {}

    public static MovieDTO toDTO(Movie m) {
        return new MovieDTO(m.getId(), m.getTitle(), m.getDescription(), m.getDuration(), m.getGenre(),
                m.getPosterUrl(), m.getTrailerUrl(), m.getReleaseDate(), m.getStatus());
    }

    public static void apply(MovieDTO d, Movie m) {
        m.setTitle(d.title().trim());
        m.setDescription(d.description());
        m.setDuration(d.duration());
        m.setGenre(d.genre());
        m.setPosterUrl(d.posterUrl());
        m.setTrailerUrl(d.trailerUrl());
        m.setReleaseDate(d.releaseDate());
        m.setStatus(d.status() != null ? d.status() : MovieStatus.UPCOMING);
    }
}
