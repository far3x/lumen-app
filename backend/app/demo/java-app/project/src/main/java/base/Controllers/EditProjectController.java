package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.ResourceBundle;

import org.apache.hc.core5.http.ParseException;

import base.App;
import base.BaseJava.Project;
import base.util.ApiService;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class EditProjectController implements Initializable {
    private final ApiService apiService = App.getApiService();
    private PrimaryController primaryController;
    private Project project;

    @FXML
    private TextField projectNameField;
    @FXML
    private TextArea descriptionArea;
    @FXML
    private DatePicker deadlinePicker;
    @FXML
    private ComboBox<String> priorityComboBox;
    
    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        priorityComboBox.setItems(FXCollections.observableArrayList("HIGH", "MEDIUM", "LOW"));
    }

    public void setPrimaryController(PrimaryController primaryController) {
        this.primaryController = primaryController;
    }

    public void setProject(Project project) {
        this.project = project;
        projectNameField.setText(project.getName());
        descriptionArea.setText(project.getDescription());
        deadlinePicker.setValue(project.getDeadline().toLocalDate());
        priorityComboBox.setValue(project.getPriority());
    }

     @FXML
    private void handleUpdateProject(ActionEvent event) {
        String projectName = projectNameField.getText();
        String description = descriptionArea.getText();
        LocalDate deadline = deadlinePicker.getValue();
          String priority = priorityComboBox.getValue();
        if (projectName.isEmpty() || description.isEmpty() || deadline == null || priority == null || priority.isEmpty()) {
            showAlert("Error", "Please fill in all fields.", Alert.AlertType.ERROR);
            return;
        }

        try {
            // Convert LocalDate to java.sql.Date before updating
            Date sqlDeadline = Date.valueOf(deadline);
            
            // Members from the project to send as parameters
            HashMap<String, String> members = new HashMap<>(project.getMembers());

             Project updatedProject = apiService.updateProject(project.getId(), projectName, description, deadline, priority, members);

           if (updatedProject != null) {
              primaryController.refreshProjectList();
               closeWindow();
             } else {
                showAlert("Error", "Failed to update project.", Alert.AlertType.ERROR);
             }
         } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to update project.", Alert.AlertType.ERROR);
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