package com.wajih.banking;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wajih.banking.service.AIService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BankingAppApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AIService aiService;

    @Test
    void authAndProtectedBankingFlowWorks() throws Exception {
        String aliceToken = registerAndToken("alice", "password");
        String bobToken = registerAndToken("bob", "password");

        mockMvc.perform(get("/api/balance/alice"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(post("/api/deposit/alice")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":100.00,"source":"Bank Account","note":"Initial funding"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("DEPOSIT"))
                .andExpect(jsonPath("$.data.source").value("Bank Account"));

        mockMvc.perform(post("/api/transfer/alice")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"toUsername":"bob","amount":25.00,"note":"Dinner"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("TRANSFER"))
                .andExpect(jsonPath("$.data.recipient").value("bob"));

        mockMvc.perform(post("/api/payments/alice")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "biller":"Spotify",
                                  "amount":9.99,
                                  "category":"Entertainment",
                                  "paymentMethod":"Bank Balance",
                                  "note":"Monthly subscription"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("PAYMENT"))
                .andExpect(jsonPath("$.data.biller").value("Spotify"));

        mockMvc.perform(get("/api/balance/bob")
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(25.0));

        when(aiService.chat(eq("How am I doing?"), anyDouble(), any())).thenReturn("Your account looks healthy.");

        mockMvc.perform(post("/api/ai/chat/alice")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message":"How am I doing?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.response").value("Your account looks healthy."));
    }

    @Test
    void loginReturnsJwt() throws Exception {
        registerAndToken("charlie", "password");

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", ipFor("charlie-login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"charlie","password":"password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value("charlie"));
    }

    @Test
    void loginRateLimitReturnsTooManyRequests() throws Exception {
        registerAndToken("limited-user", "password");
        String clientIp = "203.0.113.50";

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"username":"limited-user","password":"wrong-password"}
                                    """))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"limited-user","password":"wrong-password"}
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Too many requests. Please try again later."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void balanceCacheInvalidatesAfterDeposit() throws Exception {
        String token = registerAndToken("cache-user", "password");

        mockMvc.perform(get("/api/balance/cache-user")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(0.0));

        mockMvc.perform(post("/api/deposit/cache-user")
                        .header("Authorization", bearer(token))
                        .header("X-Forwarded-For", "203.0.113.60")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":42.00,"source":"Bank Account","note":"Cache invalidation"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/balance/cache-user")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(42.0));
    }

    private String registerAndToken(String username, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .header("X-Forwarded-For", ipFor(username))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value(username))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String ipFor(String value) {
        int host = Math.abs(value.hashCode() % 200) + 1;
        return "198.51.100." + host;
    }
}
