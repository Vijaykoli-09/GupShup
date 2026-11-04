package gupshup_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 15)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 15)
    private String lastName;

    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    @Column(nullable = false, length = 20)
    private String city;

    @Column(name = "passcode_hash", length = 100)
    private String passcodeHash;

    @Column(name = "public_username", unique = true, length = 40)
    private String publicUsername;

    @Column(name = "username_changed_at")
    private Instant usernameChangedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.PENDING;

    @Column(name = "ban_until")
    private Instant banUntil;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; }
    public void setLastName(String v) { this.lastName = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getCity() { return city; }
    public void setCity(String v) { this.city = v; }
    public String getPasscodeHash() { return passcodeHash; }
    public void setPasscodeHash(String v) { this.passcodeHash = v; }
    public String getPublicUsername() { return publicUsername; }
    public void setPublicUsername(String v) { this.publicUsername = v; }
    public Instant getUsernameChangedAt() { return usernameChangedAt; }
    public void setUsernameChangedAt(Instant v) { this.usernameChangedAt = v; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus v) { this.status = v; }
    public Instant getBanUntil() { return banUntil; }
    public void setBanUntil(Instant v) { this.banUntil = v; }
    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int v) { this.failedAttempts = v; }
    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant v) { this.lockedUntil = v; }
    public Instant getCreatedAt() { return createdAt; }
}