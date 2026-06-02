package example.cashcard;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cashcards")
class CashCardController {

    private final CashCardRepository repository;
    record TransferRequest(Long fromCardId, Long toCardId, Double amount) {}

    CashCardController(CashCardRepository repository) {
        this.repository = repository;
    }

    // GET /cashcards/{id} - Returns a card (only if it belongs to the user)
    @GetMapping("/{requestedId}")
    ResponseEntity<CashCard> findById(@PathVariable Long requestedId, Principal principal) {
        CashCard card = repository.findByIdAndOwner(requestedId, principal.getName());
        if (card != null) {
            return ResponseEntity.ok(card);
        }
        return ResponseEntity.notFound().build();
    }

    // GET /cashcards - Returns all cards for the user 
    @GetMapping
    ResponseEntity<List<CashCard>> findAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "amount") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            Principal principal) {

        Sort.Direction dir = direction.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        Page<CashCard> pageResult = repository.findByOwner(
                principal.getName(),
                PageRequest.of(page, size, Sort.by(dir, sortBy))
        );
        return ResponseEntity.ok(pageResult.getContent());
    }
    @PostMapping("/transfer")
        @Transactional
            ResponseEntity<?> transfer(@RequestBody TransferRequest request, Principal principal) {
        
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
            CashCard fromCard = repository.findById(request.fromCardId())
                    .orElse(null);
            CashCard toCard = repository.findById(request.toCardId())
                    .orElse(null);
        
            if (fromCard == null || toCard == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check ownership of fromCard and toCard (must belong to the user)
            if(!fromCard.owner().equals(principal.getName()) || !toCard.owner().equals(principal.getName())) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Δεν έχεις δικαίωμα να μεταφέρεις από αυτή την κάρτα"));
        }
            // Check balance
            if (fromCard.amount() < request.amount()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ανεπαρκές υπόλοιπο",
                                     "available", fromCard.amount()));
            }
        
            // Calculate new amounts and save
            repository.save(
                    new CashCard(fromCard.id(), fromCard.amount() - request.amount(), fromCard.owner())
            );
            repository.save(
                    new CashCard(toCard.id(), toCard.amount() + request.amount(), toCard.owner())
            );
        
            // Return the result
            return ResponseEntity.ok(Map.of(
                    "message", "Μεταφορά επιτυχής",
                    "from",    Map.of("id", fromCard.id(), "newAmount", fromCard.amount() - request.amount()),
                    "to",      Map.of("id", toCard.id(),   "newAmount", toCard.amount()   + request.amount())
            ));
        }   
}
