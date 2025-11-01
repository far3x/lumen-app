package api.jgdiffapi.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@RequestBody AuthRequest authRequest) {
        return userService.createUser(authRequest.getUsername(), authRequest.getPassword()) ?
               new ResponseEntity<>(new AuthResponse("Account created successfully"), HttpStatus.CREATED) :
               new ResponseEntity<>(new AuthResponse("Error account not created"), HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest) {
        return userService.loginUser(authRequest.getUsername(), authRequest.getPassword()) ?
               new ResponseEntity<>(new AuthResponse("Login successful"), HttpStatus.OK) :
               new ResponseEntity<>(new AuthResponse("Login failed"), HttpStatus.UNAUTHORIZED);
    }
}