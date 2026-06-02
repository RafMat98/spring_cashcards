package example.cashcard;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface CashCardRepository
        extends CrudRepository<CashCard, Long>,
                PagingAndSortingRepository<CashCard, Long> {

    // Find card by specific id AND owner (ownership check)
    CashCard findByIdAndOwner(Long id, String owner);

    // Find all cards for a specific owner (with pagination)
    Page<CashCard> findByOwner(String owner, PageRequest pageRequest);

    // Does a card exist with the given id and owner?
    boolean existsByIdAndOwner(Long id, String owner);
}
