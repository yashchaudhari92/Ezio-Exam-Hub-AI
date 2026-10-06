package com.onlineExam.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;

@Configuration
public class PhonePeConfig {

    @Value("${phonepe.client-id:}")
    private String clientId;

    @Value("${phonepe.client-secret:}")
    private String clientSecret;

    @Value("${phonepe.client-version:1}")
    private Integer clientVersion;

    @Value("${phonepe.environment:SANDBOX}")
    private String environment;

    @Value("${phonepe.redirect-url:http://localhost:5173/payment/phonepe/callback}")
    private String redirectUrl;

    @Value("${phonepe.callback.username:}")
    private String callbackUsername;

    @Value("${phonepe.callback.password:}")
    private String callbackPassword;

    public StandardCheckoutClient getClient() {

        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException(
                    "PhonePe client ID is not configured."
            );
        }

        if (clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException(
                    "PhonePe client secret is not configured."
            );
        }

        Env env;

        if ("PRODUCTION".equalsIgnoreCase(environment)) {
            env = Env.PRODUCTION;
        } else {
            env = Env.SANDBOX;
        }

        return StandardCheckoutClient.getInstance(
                clientId,
                clientSecret,
                clientVersion,
                env
        );
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public String getEnvironment() {
        return environment;
    }

    public String getCallbackUsername() {
        return callbackUsername;
    }

    public String getCallbackPassword() {
        return callbackPassword;
    }
}