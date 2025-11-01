package base;

import java.io.IOException;

import base.util.ApiService;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage; 

public class App extends Application {

    private static Scene scene;
    private static ApiService apiService;

    public static ApiService getApiService() {
        return apiService;
    }

    @Override
    public void start(Stage stage) throws IOException {
        apiService = new ApiService();
        //scene = new Scene(loadFXML("secondary"), 700, 500);
        scene = new Scene(loadFXML("secondary"), 700, 500);
        stage.setScene(scene);
        stage.show();
    }

    public static void setRoot(String fxml) throws IOException {
        scene.setRoot(loadFXML(fxml));
    }

    private static Parent loadFXML(String fxml) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(App.class.getResource(fxml + ".fxml"));
        return fxmlLoader.load();
    }

    public static void main(String[] args) {
        launch();
    }
}