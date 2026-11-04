package gupshup_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    @Value("${app.otp.demo-code}")
    private String demoCode;

    public void sendOtp(String phone) {
        // DEMO: no SMS is sent. Replace with a real SMS provider later.
    }

    public boolean verifyOtp(String phone, String otp) {
        // DEMO: fixed OTP. Replace with real OTP verification later.
        return demoCode.equals(otp);
    }
}