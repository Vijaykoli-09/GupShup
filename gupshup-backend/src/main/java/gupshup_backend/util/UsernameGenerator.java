package gupshup_backend.util;

import java.security.SecureRandom;
import java.util.List;

public final class UsernameGenerator {

    private static final List<String> ADJECTIVES = List.of(
        "Silent", "Blue", "Crazy", "Hidden", "Smart", "Midnight", "Brave", "Lucky",
        "Swift", "Calm", "Golden", "Wild", "Happy", "Clever", "Mighty", "Gentle");

    private static final List<String> NOUNS = List.of(
        "Tiger", "Moon", "Falcon", "Wolf", "Panda", "Rider", "Eagle", "Lion",
        "River", "Comet", "Fox", "Hawk", "Storm", "Phoenix", "Otter", "Cobra");

    private static final SecureRandom RANDOM = new SecureRandom();

    private UsernameGenerator() {}

    public static String generate() {
        String adj = ADJECTIVES.get(RANDOM.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(RANDOM.nextInt(NOUNS.size()));
        int number = 100 + RANDOM.nextInt(900);
        return adj + noun + number;
    }
}