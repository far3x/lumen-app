package base.Controllers;

import base.App;
import base.BaseJava.Employee;
import base.util.ApiService;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import org.apache.hc.core5.http.ParseException;

import java.io.IOException;
import java.net.URISyntaxException;

public class CreateEmployeeController {
    private final ApiService apiService = App.getApiService();
    private PrimaryController primaryController;

    @FXML
    private TextField employeeNameField;

    public void setPrimaryController(PrimaryController primaryController) {
        this.primaryController = primaryController;
    }

    @FXML
    private void handleCreateEmployee(ActionEvent event) {
        String employeeName = employeeNameField.getText();

        if (employeeName.isEmpty()) {
            showAlert("Error", "Please enter employee name.", Alert.AlertType.ERROR);
            return;
        }

        try {
            Employee createdEmployee = apiService.createEmployee(employeeName);
            if (createdEmployee != null) {
                primaryController.refreshEmployeeList();
                closeWindow();
            } else {
                showAlert("Error", "Failed to create employee.", Alert.AlertType.ERROR);
            }
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to create employee.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleCancel(ActionEvent event) {
        closeWindow();
    }

    private void closeWindow() {
        Stage stage = (Stage) employeeNameField.getScene().getWindow();
        stage.close();
    }

    private void showAlert(String title, String content, Alert.AlertType alertType) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}