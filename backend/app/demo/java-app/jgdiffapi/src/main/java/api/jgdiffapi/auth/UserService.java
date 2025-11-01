package api.jgdiffapi.auth;

import api.jgdiffapi.security.User;
import api.jgdiffapi.security.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public boolean createUser(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()){
            return false;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        userRepository.save(user);
        return true;
    }

    public boolean loginUser(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);

        return user.isPresent() && user.get().getPassword().equals(password);

    }
}