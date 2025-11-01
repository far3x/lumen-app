package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;

import org.apache.hc.core5.http.ParseException;

import base.App;
import base.util.ApiService;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class ThirdController {
    private final ApiService apiService = App.getApiService();

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private PasswordField cpasswordField;
    @FXML
    private Button signupButton;

    @FXML
    private void handleSignupButton(ActionEvent event) throws IOException {
        String username = usernameField.getText();
        String password = passwordField.getText();
        String confirmPassword = cpasswordField.getText();

        if (!password.equals(confirmPassword)) {
            showAlert("Error", "Passwords do not match.", Alert.AlertType.ERROR);
            return;
        }

        try {
            String response = apiService.signup(username, password);
            showAlert("Success", "Account created successfully.", Alert.AlertType.INFORMATION);
            System.out.println("Account created successfully: " + response);

            // Load the login page (secondary.fxml) after successful signup
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/secondary.fxml"));
            Parent root = loader.load();
            Stage stage = (Stage) ((Node) event.getSource()).getScene().getWindow();
            Scene scene = new Scene(root);
            stage.setScene(scene);
            stage.show();

        } catch (URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to create account.", Alert.AlertType.ERROR);
        }
    }

    private void showAlert(String title, String content, Alert.AlertType alertType) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}