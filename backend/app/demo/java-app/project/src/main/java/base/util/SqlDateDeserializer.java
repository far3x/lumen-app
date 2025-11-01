package base.util;

import java.io.IOException;
import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class SqlDateDeserializer extends JsonDeserializer<Date> {
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        try {
            String dateString = p.getText();
            if (dateString != null && dateString.length() > 10) {
                dateString = dateString.substring(0, 10); // Truncate to keep only the date part
            }
            java.util.Date utilDate = dateFormat.parse(dateString);
            return new Date(utilDate.getTime());
        } catch (ParseException e) {
            throw new IOException("Failed to parse date", e);
        }
    }
}