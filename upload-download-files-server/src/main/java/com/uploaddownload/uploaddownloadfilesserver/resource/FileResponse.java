package com.uploaddownload.uploaddownloadfilesserver.resource;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileResponse {
    private byte[] data;
}
