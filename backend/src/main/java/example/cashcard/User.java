package example.cashcard;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;

@Table("users")
record User(
        @Id Long id,
        String username,
        String password,   // BCrypt hash
        String role       
) {}

interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findAll();                          
    @Modifying
    @Query("DELETE FROM users WHERE username = :username")
    void deleteByUsername(String username);
}
