package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

/**
 * Handles all Supabase Auth Admin API interactions (create, update, delete users).
 * Extracted from AdminService to satisfy the Single Responsibility Principle.
 */
@Service
@RequiredArgsConstructor
public class SupabaseAuthService {

    private final SupabaseProperties supabaseProperties;
    private final WebClient webClient = WebClient.create();

    /**
     * Creates a user in Supabase Auth and returns the generated user ID.
     */
    public UUID createUser(Map<String, Object> supabaseBody) {
        Map<?, ?> response = webClient.post()
                .uri(supabaseProperties.getUrl() + "/auth/v1/admin/users")
                .header("apikey", supabaseProperties.getServiceRoleKey())
                .header("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(supabaseBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("id")) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to retrieve user ID from Supabase response");
        }

        return UUID.fromString((String) response.get("id"));
    }

    /**
     * Updates a user in Supabase Auth.
     */
    public void updateUser(UUID userId, Map<String, Object> supabaseBody) {
        try {
            webClient.put()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/admin/users/" + userId)
                    .header("apikey", supabaseProperties.getServiceRoleKey())
                    .header("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(supabaseBody)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to update user in Supabase: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a user from Supabase Auth. Logs a warning on failure but does not throw.
     */
    public void deleteUser(UUID userId) {
        try {
            webClient.delete()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/admin/users/" + userId)
                    .header("apikey", supabaseProperties.getServiceRoleKey())
                    .header("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            System.err.println("Warning: Failed to delete user from Supabase: " + e.getMessage());
        }
    }
}
