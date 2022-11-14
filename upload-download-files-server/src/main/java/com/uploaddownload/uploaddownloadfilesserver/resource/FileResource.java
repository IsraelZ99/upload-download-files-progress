package com.uploaddownload.uploaddownloadfilesserver.resource;

import org.apache.tomcat.util.codec.binary.Base64;
import org.overviewproject.mime_types.GetBytesException;
import org.overviewproject.mime_types.MimeTypeDetector;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static java.nio.file.Paths.get;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.springframework.http.HttpHeaders.*;

@RestController
@RequestMapping("/api/file")
public class FileResource {

    private static final String AUDIO_PATH = "/static/audios";
    private final MimeTypeDetector mimeTypeDetector = new MimeTypeDetector();

    //TODO: Define a location
    public static final String DIRECTORY = System.getProperty("user.home") + "/Documents/uploads-demo/";

    //TODO: Define a method to upload files
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") List<MultipartFile> multipartFiles) throws IOException {
        List<String> fileNames = new ArrayList<>();
        for (MultipartFile file : multipartFiles) {
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Path fileStorage = Paths.get(DIRECTORY, filename).toAbsolutePath().normalize();
            Files.copy(file.getInputStream(), fileStorage, REPLACE_EXISTING);
            fileNames.add(filename);
        }
        return ResponseEntity.ok().body(fileNames);
    }

    //TODO Define a method to download files
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFiles(@PathVariable("filename") String filename) throws IOException {
        Path filePath = get(DIRECTORY).toAbsolutePath().normalize().resolve(filename);
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException(filename + " was not found on the server");
        }
        Resource resource = new UrlResource(filePath.toUri());
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("File-Name", filename);
        httpHeaders.add(CONTENT_DISPOSITION, "attachment;File-Name=" + resource.getFilename());
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(Files.probeContentType(filePath)))
                .headers(httpHeaders).body(resource);
    }


    @GetMapping("byte/download/{filename}")
    public ResponseEntity<?> downloadFileFromBytes(@PathVariable("filename") String filename) throws IOException, GetBytesException {
        File file = get(getFilePath(AUDIO_PATH), filename).toFile();
        byte[] encodeToBytes = encodeFileToBase64Binary(file);
        String encodeString = new String(encodeToBytes, "UTF-8");
        String mimeType = mimeTypeDetector.detectMimeType(filename, () -> encodeToBytes);
        HttpHeaders headers = new HttpHeaders();
        headers.add("File-Name", filename);
        headers.set(CONTENT_DISPOSITION, "attachment;File-Name=" + filename);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON)
                .headers(headers).body(new FileResponse(encodeString.getBytes()));
    }

    private byte[] encodeFileToBase64Binary(File file) throws IOException {
        FileInputStream fileInputStreamReader = new FileInputStream(file);
        byte[] bytes = new byte[(int) file.length()];
        fileInputStreamReader.read(bytes);
        return Base64.encodeBase64(bytes);
//        return new String(Base64.encodeBase64(bytes), "UTF-8");
    }

    private String getFilePath(String location) {
        URL url = this.getClass().getResource(location);
        return new File(url.getFile()).getAbsolutePath();
    }

}
