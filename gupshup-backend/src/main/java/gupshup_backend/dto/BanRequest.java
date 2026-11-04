package gupshup_backend.dto;

import gupshup_backend.entity.BanDuration;
import jakarta.validation.constraints.NotNull;

public record BanRequest(@NotNull(message = "Please select a ban duration") BanDuration duration) {}
