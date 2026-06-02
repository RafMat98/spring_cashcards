package example.cashcard;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")  
class AdminController {

    private final UserRepository userRepository;
    private final CashCardRepository cashCardRepository;
    private final PasswordEncoder passwordEncoder;
    record TransferRequest(Long fromCardId, Long toCardId, Double amount) {}


    AdminController(UserRepository userRepository,
                    CashCardRepository cashCardRepository,
                    PasswordEncoder passwordEncoder) {
        this.userRepository    = userRepository;
        this.cashCardRepository = cashCardRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    // GET /admin/users — all users
    @GetMapping("/users")
    ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id",       u.id(),
                        "username", u.username(),
                        "role",     u.role()
                        
                ))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/cards")
        ResponseEntity<CashCard> createCardForUser(@RequestBody Map<String, Object> body) {
        String owner  = (String) body.get("owner");
        Object amountObj = body.get("amount");

        // Validation
        if (owner == null || owner.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (amountObj == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if user exists
        if (userRepository.findByUsername(owner).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Double amount = ((Number) amountObj).doubleValue();
        if (amount <= 0) {
            return ResponseEntity.badRequest().build();
        }

        CashCard saved = cashCardRepository.save(new CashCard(amount, owner));
        return ResponseEntity.status(201).body(saved);
}

    @PostMapping("/transfer")
        @Transactional
            ResponseEntity<?> transfer(@RequestBody TransferRequest request) {
        
            // Validation
            if (request.amount() == null || request.amount() <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Το ποσό πρέπει να είναι θετικό"));
            }
        
            if (request.fromCardId().equals(request.toCardId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Δεν μπορείς να μεταφέρεις στο ίδιο card"));
            }
        
            // find cards
            CashCard fromCard = cashCardRepository.findById(request.fromCardId())
                    .orElse(null);
            CashCard toCard = cashCardRepository.findById(request.toCardId())
                    .orElse(null);
        
            if (fromCard == null || toCard == null) {
                return ResponseEntity.notFound().build();
            }
        
            // Check balance
            if (fromCard.amount() < request.amount()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ανεπαρκές υπόλοιπο",
                                     "available", fromCard.amount()));
            }
        
            // calculate new amounts and save
            cashCardRepository.save(
                    new CashCard(fromCard.id(), fromCard.amount() - request.amount(), fromCard.owner())
            );
            cashCardRepository.save(
                    new CashCard(toCard.id(), toCard.amount() + request.amount(), toCard.owner())
            );
        
            // Return result
            return ResponseEntity.ok(Map.of(
                    "message", "Μεταφορά επιτυχής",
                    "from",    Map.of("id", fromCard.id(), "newAmount", fromCard.amount() - request.amount()),
                    "to",      Map.of("id", toCard.id(),   "newAmount", toCard.amount()   + request.amount())
            ));
        }   
    // GET /admin/cards — all cards 
    @GetMapping("/cards")
    ResponseEntity<Iterable<CashCard>> getAllCards() {
        return ResponseEntity.ok(cashCardRepository.findAll());
    }

    // POST /admin/users — User creation 
    @PostMapping("/users")
    ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role     = body.getOrDefault("role", "USER").toUpperCase();

        if (username == null || password == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!role.equals("USER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().build();
        }
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(409).build(); // conflict
        }

        User newUser = new User(null, username, passwordEncoder.encode(password), role);
        User saved   = userRepository.save(newUser);

        return ResponseEntity.status(201).body(Map.of(
                "id",       saved.id(),
                "username", saved.username(),
                "role",     saved.role()
        ));
    }

    // DELETE /admin/users/{username} — delete user (and their cards)
    @DeleteMapping("/users/{username}")
    ResponseEntity<Void> deleteUser(@PathVariable String username) {
        if (userRepository.findByUsername(username).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // First, delete the cards 
        cashCardRepository.findAll().forEach(card -> {
            if (card.owner().equals(username) && card.amount() == 0) {
                cashCardRepository.deleteById(card.id());
            }
        });
        userRepository.deleteByUsername(username);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/cards/{id}")
    ResponseEntity<Void> deleteCard(@PathVariable Long id) {
    if (!cashCardRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }
    cashCardRepository.deleteById(id);
    return ResponseEntity.noContent().build();
}
    
}
