package com.example.aos_backend.Util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

public class DocumentUtil {

    public static byte[] compressDocument(byte[] data) {
        // Implémentation de la compression du document
        Deflater deflater = new Deflater();
        deflater.setLevel(Deflater.BEST_COMPRESSION);

        deflater.setInput(data);
        deflater.finish();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[4 * 1024];
        while (!deflater.finished()) {
            int bytesRead = deflater.deflate(buffer);
            outputStream.write(buffer, 0, bytesRead);
        }

        try {
            outputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return outputStream.toByteArray();
    }

    public static byte[] decompressDocument(byte[] data) {
        // Implémentation de la décompression du document
        Inflater inflater = new Inflater();
        inflater.setInput(data);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[4 * 1024];
        try {
            while (!inflater.finished()) {
                int bytesRead = inflater.inflate(buffer);
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return outputStream.toByteArray();
    }

}
