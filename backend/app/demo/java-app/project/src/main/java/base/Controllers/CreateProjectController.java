package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;
import java.time.LocalDate;

import org.apache.hc.core5.http.ParseException;

import base.App;
import base.BaseJava.Project;
import base.util.ApiService;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class CreateProjectController {
    private final ApiService apiService = App.getApiService();
    private PrimaryController primaryController;

    @FXML
    private TextField projectNameField;
    @FXML
    private TextArea descriptionArea;
    @FXML
    private DatePicker deadlinePicker;
    @FXML
    private ComboBox<String> priorityComboBox;

    public void initialize() {
        priorityComboBox.setItems(FXCollections.observableArrayList("High", "Medium", "Low"));
    }

    public void setPrimaryController(PrimaryController primaryController) {
        this.primaryController = primaryController;
    }

    @FXML
    private void handleCreateProject(ActionEvent event) {
        String projectName = projectNameField.getText();
        String description = descriptionArea.getText();
        LocalDate deadline = deadlinePicker.getValue();
        String priority = priorityComboBox.getValue();

        if (projectName.isEmpty() || description.isEmpty() || deadline == null || priority == null || priority.isEmpty()) {
            showAlert("Error", "Please fill in all fields.", Alert.AlertType.ERROR);
            return;
        }

        try {
            Project createdProject = apiService.createProject(projectName, description, deadline, priority);
            if (createdProject != null) {
                primaryController.refreshProjectList();
                closeWindow();
            } else {
                showAlert("Error", "Failed to create project.", Alert.AlertType.ERROR);
            }
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to create project.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleCancel(ActionEvent event) {
        closeWindow();
    }

    private void closeWindow() {
        Stage stage = (Stage) projectNameField.getScene().getWindow();
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