package example.cashcard;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Table("cash_card")
public record CashCard(
        @Id Long id,
        @NotNull @Positive Double amount,
        String owner
) {
    // Constructor without id for creating new cards
    public CashCard(Double amount, String owner) {
        this(null, amount, owner);
    }
}
