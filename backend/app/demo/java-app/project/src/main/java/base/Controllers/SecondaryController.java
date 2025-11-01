package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;

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
import javafx.scene.control.Hyperlink;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class SecondaryController {
    private final ApiService apiService = App.getApiService();

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private Button loginButton;
    @FXML
    private Hyperlink createAccount;

    @FXML
    private void handleLoginButton(ActionEvent event) throws IOException {
        String username = usernameField.getText();
        String password = passwordField.getText();

        try {
            String response = apiService.login(username, password);
            // Check if the response contains "Login successful"
            if (response.contains("Login successful")) {
                System.out.println("Login successful: " + response);

                // Try-catch block specifically for scene loading and transition
                try {
                    URL fxmlLocation = getClass().getResource("/base/primary.fxml");
                    if (fxmlLocation == null) {
                        showAlert("Error", "Could not find primary.fxml", Alert.AlertType.ERROR);
                        return;
                    }

                    FXMLLoader loader = new FXMLLoader(fxmlLocation);
                    Parent root = loader.load();

                    Stage stage = (Stage) ((Node) event.getSource()).getScene().getWindow();
                    Scene scene = new Scene(root);
                    stage.setScene(scene);
                    stage.show();
                } catch (IOException e) {
                    showAlert("Error", "Failed to load the main page.", Alert.AlertType.ERROR);
                    System.out.println(e);
                }
            } else {
                // If the response does not contain "Login successful", treat it as a failed login
                showAlert("Login Failed", "Invalid username or password.", Alert.AlertType.ERROR);
            }
        } catch (URISyntaxException | ParseException e) {
            showAlert("Login Failed", "Error during login: " + e.getMessage(), Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleCreateAccount(ActionEvent event) throws IOException {
        URL fxmlLocation = getClass().getResource("/base/third.fxml");
        if (fxmlLocation == null) {
            showAlert("Error", "Could not find third.fxml", Alert.AlertType.ERROR);
            return;
        }

        FXMLLoader loader = new FXMLLoader(fxmlLocation);
        Parent root = loader.load();

        Stage stage = (Stage) ((Node) event.getSource()).getScene().getWindow();
        Scene scene = new Scene(root);
        stage.setScene(scene);
        stage.show();
    }

    private void showAlert(String title, String content, Alert.AlertType alertType) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}