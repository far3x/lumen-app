module base {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.graphics;
    requires com.fasterxml.jackson.databind;
    requires com.fasterxml.jackson.datatype.jsr310;
    requires org.apache.httpcomponents.client5.httpclient5;
    requires org.apache.httpcomponents.core5.httpcore5;
    requires java.sql; // Add this line for sql fix not importing

    opens base to javafx.fxml, javafx.graphics;
    opens base.Controllers to javafx.fxml;
    opens base.BaseJava to com.fasterxml.jackson.databind;
    exports base;
}