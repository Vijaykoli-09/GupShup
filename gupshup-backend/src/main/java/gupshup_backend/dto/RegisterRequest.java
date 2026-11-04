package gupshup_backend.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 15, message = "First name must be 2 to 15 characters")
    @Pattern(regexp = "^[A-Za-z]+( [A-Za-z]+)*$", message = "First name can contain only letters and single spaces")
    String firstName,

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 15, message = "Last name must be 2 to 15 characters")
    @Pattern(regexp = "^[A-Za-z]+( [A-Za-z]+)*$", message = "Last name can contain only letters and single spaces")
    String lastName,

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
    String phone,

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 20, message = "City must be 2 to 20 characters")
    @Pattern(regexp = "^[A-Za-z]+( [A-Za-z]+)*$", message = "City can contain only letters and single spaces")
    String city
) {}